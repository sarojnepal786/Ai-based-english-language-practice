import { useState, useRef, useEffect } from 'react'
import mammoth from 'mammoth'
import Tesseract from 'tesseract.js'
import '../App.css'
import type { Message } from '../types'

interface FileContent {
  content: string;
  preview: string | null;
}

interface TesseractLogger {
  status: string;
  progress: number;
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your English learning assistant. How can I help you today?\n\n💡 Try uploading an image or document for analysis, or just ask me anything!", sender: 'bot', timestamp: new Date() }
  ])
  const [inputMessage, setInputMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileContent, setFileContent] = useState<string>('')
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [isReadingFile, setIsReadingFile] = useState<boolean>(false)
  const [ocrProgress, setOcrProgress] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<string>('llava:latest')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<null | HTMLDivElement>(null)

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Copy message to clipboard
  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      // Show a brief success message
      const notification = document.createElement('div')
      notification.textContent = 'Copied to clipboard!'
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        font-size: 0.9rem;
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease'
        setTimeout(() => document.body.removeChild(notification), 300)
      }, 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB. Please choose a smaller file.')
        return
      }
      handleFileFromDrop(file)
    }
  }

  // Convert image to base64
  const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Convert PDF page to image for OCR
  const convertPDFToImages = async (arrayBuffer: ArrayBuffer): Promise<string[]> => {
    try {
      const pdfjsLib = await import('pdfjs-dist')
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const images: string[] = []
      
      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) { // Limit to first 5 pages
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = viewport.width
        canvas.height = viewport.height
        
        if (context) {
          await page.render({
            canvas: canvas,
            canvasContext: context,
            viewport: viewport
          }).promise
          
          images.push(canvas.toDataURL())
        }
      }
      return images
    } catch (error) {
      console.error('PDF to image conversion error:', error)
      return []
    }
  }

  // Perform OCR on image
  const performOCR = async (imageData: string): Promise<string> => {
    try {
      setOcrProgress('Recognizing text from image...')
      const { data } = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: (m: TesseractLogger) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(`OCR Progress: ${Math.round(m.progress * 100)}%`)
            }
          }
        }
      )
      return data.text
    } catch (error) {
      console.error('OCR error:', error)
      return ''
    }
  }

  const readFileContent = async (file: File): Promise<FileContent> => {
    try {
      // Images - use OCR for text extraction
      if (file.type.startsWith('image/')) {
        const base64Image = await imageToBase64(file)
        setOcrProgress('Processing image with OCR...')
        const ocrText = await performOCR(base64Image)
        
        if (ocrText && ocrText.trim()) {
          return {
            content: `[Image uploaded: ${file.name} - Text extracted via OCR]\n\nExtracted Text:\n${ocrText}`,
            preview: base64Image
          }
        } else {
          return {
            content: `[Image uploaded: ${file.name} - Ready for analysis with LLaVA vision model]`,
            preview: base64Image
          }
        }
      }
      // Text files
      else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsText(file)
        })
        return { content, preview: null }
      }
      // PDF files
      else if (file.type === 'application/pdf') {
        try {
          // First try text extraction with pdf-parse
          const pdfParseModule = await import('pdf-parse')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const pdfParse = (pdfParseModule as any).default
          const arrayBuffer = await file.arrayBuffer()
          const data = await pdfParse(arrayBuffer)
          
          // If extracted text is very short or mostly empty, try OCR
          if (!data.text || data.text.trim().length < 50) {
            setOcrProgress('PDF appears to be scanned. Performing OCR...')
            const pageImages = await convertPDFToImages(arrayBuffer)
            let fullOcrText = ''
            
            for (let i = 0; i < pageImages.length; i++) {
              setOcrProgress(`Processing page ${i + 1}/${pageImages.length} with OCR...`)
              const pageText = await performOCR(pageImages[i])
              fullOcrText += `\n--- Page ${i + 1} ---\n${pageText}\n`
            }
            
            if (fullOcrText.trim()) {
              return { 
                content: `[PDF: ${file.name} - Text extracted via OCR (scanned document)]\n\n${fullOcrText}`,
                preview: null 
              }
            } else {
              return { 
                content: `[PDF file: ${file.name} - Could not extract text even with OCR. The file might be corrupted or password protected.]`,
                preview: null 
              }
            }
          }
          
          return { content: data.text, preview: null }
        } catch (error) {
          console.error('PDF parsing error:', error)
          // Try OCR as fallback
          try {
            setOcrProgress('PDF text extraction failed. Attempting OCR...')
            const arrayBuffer = await file.arrayBuffer()
            const pageImages = await convertPDFToImages(arrayBuffer)
            let fullOcrText = ''
            
            for (let i = 0; i < pageImages.length; i++) {
              setOcrProgress(`Processing page ${i + 1}/${pageImages.length} with OCR...`)
              const pageText = await performOCR(pageImages[i])
              fullOcrText += `\n--- Page ${i + 1} ---\n${pageText}\n`
            }
            
            if (fullOcrText.trim()) {
              return { 
                content: `[PDF: ${file.name} - Text extracted via OCR]\n\n${fullOcrText}`,
                preview: null 
              }
            } else {
              return { 
                content: `[PDF file: ${file.name} - Text extraction failed. The file might be scanned/image-based and OCR couldn't detect text. Please ensure the document has clear text.]`,
                preview: null 
              }
            }
          } catch {
            return { 
              content: `[PDF file: ${file.name} - Text extraction failed. Please try a text-based PDF or describe what you need from this document.]`,
              preview: null 
            }
          }
        }
      }
      // Word documents
      else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.extractRawText({ arrayBuffer })
          return { content: result.value, preview: null }
        } catch (error) {
          console.error('DOCX parsing error:', error)
          return { 
            content: `[Word document: ${file.name} - Text extraction failed. Please describe what you need from this document.]`,
            preview: null
          }
        }
      }
      // Other files
      else {
        return { 
          content: `[File uploaded: ${file.name} (${file.type}). Content extraction not supported for this file type. Please describe what you need from this file.]`,
          preview: null
        }
      }
    } catch (error) {
      console.error('Error reading file:', error)
      return { 
        content: `[Error reading file: ${file.name}]`,
        preview: null
      }
    }
  }

  const handleFileFromDrop = async (file: File): Promise<void> => {
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB. Please choose a smaller file.')
      return
    }
    
    setSelectedFile(file)
    setIsReadingFile(true)
    setOcrProgress('')
    
    try {
      const { content, preview } = await readFileContent(file)
      setFileContent(content)
      setFilePreview(preview)
      
      // Show preview in chat that file was loaded
      let fileTypeMsg = ''
      if (file.type.startsWith('image/')) {
        if (content.includes('OCR')) {
          fileTypeMsg = '🖼️ Image processed with OCR - text extracted successfully!'
        } else {
          fileTypeMsg = '🖼️ Image ready for analysis with LLaVA vision model'
        }
      } else if (file.type === 'application/pdf') {
        if (content.includes('OCR')) {
          fileTypeMsg = '📄 Scanned PDF processed with OCR - text extracted successfully!'
        } else {
          fileTypeMsg = '📄 Text-based PDF - content extracted successfully!'
        }
      } else if (file.type === 'text/plain') {
        fileTypeMsg = '📝 Text file content extracted and ready for analysis'
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        fileTypeMsg = '📋 Word document content extracted and ready for analysis'
      } else {
        fileTypeMsg = '📎 File ready for analysis'
      }
      
      const fileLoadedMessage: Message = {
        id: messages.length + 1,
        text: `✅ File loaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB)\n${fileTypeMsg}`,
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fileLoadedMessage])
    } catch (error) {
      console.error('Error reading file:', error)
      setFileContent(`[Error reading file: ${file.name}]`)
      setFilePreview(null)
    } finally {
      setIsReadingFile(false)
      setOcrProgress('')
    }
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (file) {
      await handleFileFromDrop(file)
    }
  }

  const removeFile = (): void => {
    setSelectedFile(null)
    setFileContent('')
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendMessage = async (): Promise<void> => {
    if ((!inputMessage.trim() && !selectedFile) || isLoading || isReadingFile) return

    // Create user message with file info
    let userMessageText = inputMessage || `Please analyze this ${selectedFile?.type.startsWith('image/') ? 'image' : 'file'}: ${selectedFile?.name}`
    if (selectedFile) {
      userMessageText += `\n\n📎 ${selectedFile.name}`
    }
    
    const userMessage: Message = { 
      id: messages.length + 1, 
      text: userMessageText, 
      sender: 'user',
      imagePreview: filePreview,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    const userInput = inputMessage
    const userFile = selectedFile
    const userFileContent = fileContent
    const userFilePreview = filePreview
    
    setInputMessage('')
    setSelectedFile(null)
    setFileContent('')
    setFilePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setIsLoading(true)

    try {
      let response: Response
      let botResponseText = ''
      
      // Handle images with LLaVA vision model
      if (userFile && userFile.type.startsWith('image/') && userFilePreview) {
        try {
          // Extract base64 data (remove the data:image/xxx;base64, prefix)
          const base64Data = userFilePreview.split(',')[1]
          
          // Use LLaVA model for image analysis
          response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: selectedModel,
              prompt: userInput || "Please describe this image in detail. What do you see? Include colors, objects, text, and any notable details.",
              images: [base64Data],
              stream: false,
              options: {
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 1000,
              }
            }),
          })
          
          if (!response.ok) {
            throw new Error('LLaVA model request failed')
          }
          
          const data = await response.json()
          botResponseText = data.response || "I couldn't analyze this image. Please try again."
          
        } catch (visionError) {
          console.error('LLaVA error:', visionError)
          botResponseText = `⚠️ I couldn't analyze the image with LLaVA. Please make sure the model is properly installed with 'ollama pull llava'. Error: ${visionError}`
        }
      } 
      // Handle text files and documents with qwen model
      else {
        let prompt = `You are an English learning assistant. Help the user with their learning. Be helpful, encouraging, and concise.\n\n`
        
        if (userFile) {
          prompt += `The user uploaded a file: ${userFile.name} (${userFile.type}, ${(userFile.size / 1024).toFixed(1)} KB)\n`
          
          if (userFileContent && !userFile.type.startsWith('image/')) {
            prompt += `\n--- FILE CONTENT START ---\n${userFileContent}\n--- FILE CONTENT END ---\n\n`
          }
        }
        
        prompt += `User's question: ${userInput || "Please analyze this file"}\n\n`
        prompt += `Provide helpful assistance based on the file content and user's question. If the file contains text, use that information to answer.`

        response = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel,
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.7,
              max_tokens: 1500,
            }
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to get response from Ollama')
        }

        const data = await response.json()
        botResponseText = data.response || "I'm sorry, I couldn't process that request. Could you please rephrase your question?"
      }
      
      const botResponse: Message = {
        id: messages.length + 2,
        text: botResponseText,
        sender: 'bot'
      }
      setMessages(prev => [...prev, botResponse])
      
    } catch (error) {
      console.error('Error calling Ollama:', error)
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "⚠️ Unable to connect to Ollama. Please make sure Ollama is running with 'ollama serve'.\n\nMake sure you have the required models installed:\n• For images: `ollama pull llava`\n• For text: `ollama pull gemma3:4b`",
        sender: 'bot'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <section id="center">
        <div>
          <h1>Learning Assistant</h1>
          <p>
            Chat with AI to improve your academics
          </p>
        </div>
        
        {/* Chat Container */}
        <div 
          className={`chat-container ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Model Selector at head of chat */}
          <div className="model-selector">
            <label htmlFor="model-select" className="model-label">AI Model:</label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="model-dropdown"
              disabled={isLoading || isReadingFile}
            >
              <option value="llava:latest">LLaVA (Vision + Text)</option>
              <option value="gemma3:4b">Gemma 3 (Text Only)</option>
            </select>
          </div>
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {msg.imagePreview && (
                    <div className="image-message-preview">
                      <img src={msg.imagePreview} alt="Uploaded" className="chat-image" />
                    </div>
                  )}
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                  {msg.timestamp && (
                    <div className="message-timestamp">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                <div className="message-actions">
                  <button
                    className="message-action-btn"
                    onClick={() => copyToClipboard(msg.text)}
                    title="Copy message"
                  >
                    📋
                  </button>
                </div>
              </div>
            ))}
            {(isLoading || isReadingFile) && (
              <div className="message bot">
                <div className="message-content">
                  {ocrProgress && !isLoading && (
                    <div className="ocr-progress">{ocrProgress}</div>
                  )}
                  <div className="typing-indicator">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* File Preview Area */}
          {selectedFile && (
            <div className="selected-file-preview">
              {filePreview ? (
                <div className="selected-image-preview">
                  <img src={filePreview} alt="Preview" className="preview-thumbnail" />
                  <div className="selected-file-info">
                    <span className="file-name-text">{selectedFile.name}</span>
                    <span className="file-size-text">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    <span className="file-type-badge">IMAGE</span>
                    <button className="remove-file-btn" onClick={removeFile}>✕</button>
                  </div>
                </div>
              ) : (
                <div className="selected-file-info">
                  <span className="file-icon">📎</span>
                  <span className="file-name-text">{selectedFile.name}</span>
                  <span className="file-size-text">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  <span className="file-type-badge">
                    {selectedFile.type === 'application/pdf' && 'PDF'}
                    {selectedFile.type === 'text/plain' && 'TXT'}
                    {selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && 'DOCX'}
                    {!selectedFile.type.startsWith('image/') && 
                     selectedFile.type !== 'application/pdf' && 
                     selectedFile.type !== 'text/plain' && 
                     selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && 'FILE'}
                  </span>
                  <button className="remove-file-btn" onClick={removeFile}>✕</button>
                </div>
              )}
            </div>
          )}
          
          <div className="chat-input-area">
            <button 
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isReadingFile}
              title="Upload file (Images, PDF, DOCX, TXT)"
            >
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              accept=".pdf,.txt,.docx,image/*"
            />
            <input
              type="text"
              className="chat-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything or upload an image/file..."
              disabled={isLoading || isReadingFile}
            />
            <button 
              className="chat-send-button"
              onClick={handleSendMessage}
              disabled={(!inputMessage.trim() && !selectedFile) || isLoading || isReadingFile}
            >
              Send
            </button>
          </div>
          <div className="chat-footer">
            powered by locally hosted Ollama • Current model: {selectedModel === 'llava:latest' ? 'LLaVA (Vision)' : 'Gemma 3 (Text)'} • 🖼️ OCR for images/scanned PDFs
          </div>
        </div>
      </section>

      <div className="ticks"></div>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default Chat