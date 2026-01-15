// import React, { useState, useEffect, useRef } from "react";
// // import axios from "axios";
// import "./CoffeeBot.css";

// const CoffeeBot = () => {
//   const [open, setOpen] = useState(false);
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([
//     {
//       sender: "bot",
//       text: "Hi ☕ I'm your Coffee Buddy! Tell me your mood and budget 😊",
//     },
//   ]);
//   const [loading, setLoading] = useState(false);
//   // 1. Session Management
//   // Store session_id in a ref so it doesn't change on re-renders
//   const sessionIdRef = useRef(`user_${Math.random().toString(36).substring(7)}`);
//   const chatEndRef = useRef(null);

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, loading]);

//   const sendMessage = async () => {
//     if (!input.trim() || loading) return;
//     // 1. Add User Message immediately
//     const userText = input;
//     const userMessage = { sender: "user", text: userText };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);

//     try {
//       // 2. Prepare for Streaming Response
//       // We add an empty "bot" message now, which we will fill chunk-by-chunk
//       setMessages((prev) => [...prev, { sender: "bot", text: "" }]);
//       const res = await fetch(`${import.meta.env.VITE_API_BASE}/chat/stream`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           message: userText,
//           session_id: sessionIdRef.current, // Send persistent session ID
//         }),
//       });
//       if (!res.body) throw new Error("No response body");

//       // 3. Set up the Stream Reader
//       const reader = res.body.getReader();
//       const decoder = new TextDecoder();
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         // Decode the chunk (e.g., "Ro", "bus", "ta")
//         const chunk = decoder.decode(value, { stream: true });

//         // 4. Update the LAST message with the new chunk
//         setMessages((prev) => {
//           const newMessages = [...prev];
//           const lastMsgIndex = newMessages.length - 1;
          
//           // Append chunk to the last message's text
//           newMessages[lastMsgIndex] = {
//             ...newMessages[lastMsgIndex],
//             text: newMessages[lastMsgIndex].text + chunk,
//           };
          
//           return newMessages;
//         });
//       }
//       // const botMessage = {
//       //   sender: "bot",
//       //   text: res.data.reply,
//       // };

//       // setMessages((prev) => [...prev, botMessage]);
//     } catch (error) {
//       console.error("Streaming error:", error);
//       // If error, replace the empty bot message with error text
//       setMessages((prev) => {
//         const newMessages = [...prev];
//         // Remove the empty message we added earlier if it's still empty, or append error
//         if (newMessages[newMessages.length - 1].sender === "bot") {
//              newMessages[newMessages.length - 1].text = "Oops 😔 Something went wrong!";
//         } else {
//              newMessages.push({ sender: "bot", text: "Oops 😔 Something went wrong!" });
//         }
//         return newMessages;
//       });
//     }

//     setLoading(false);
//   };
//   //     setMessages((prev) => [
//   //       ...prev,
//   //       { sender: "bot", text: "Oops 😔 Something went wrong!" },
//   //     ]);
//   //   }

//   //   setLoading(false);
//   // };

//   return (
//     <>
//       {/* Floating Button */}
//       <div className="coffee-bot-btn" onClick={() => setOpen(!open)}>
//         ☕
//       </div>

//       {/* Chat Window */}
//       {open && (
//         <div className="coffee-bot-window">
//           <div className="coffee-bot-header">
//             Coffee Buddy ☕
//             <span onClick={() => setOpen(false)}>✖</span>
//           </div>

//           <div className="coffee-bot-body">
//             {messages.map((msg, index) => (
//               <div key={index} className={`msg ${msg.sender}`}>
//                 {/* {msg.text} */}
//                 {/* Use whitespace-pre-wrap to preserve newlines from the LLM 
//                    (Gemini formats lists with \n)
//                 */}
//                 <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
//               </div>
//             ))}
//             {/* Only show "Typing..." if we are waiting for the FIRST chunk.
//                 Once text starts streaming, the text itself is the indicator. 
//                 We check if the last message is empty to know if stream started. 
//             */}
//             {/* {loading && <div className="msg bot">Typing...</div>} */}
//             {loading && messages[messages.length - 1]?.text === "" && (
//                <div className="msg bot">Typing...</div>
//             )}
//             <div ref={chatEndRef}></div>
//           </div>

//           <div className="coffee-bot-footer">
//             <input
//               type="text"
//               placeholder="I'm tired, budget 150..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//             />
//             <button onClick={sendMessage} disabled={loading}>Send</button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default CoffeeBot;

// PRETTIFIED CODE BELOW
import React, { useState, useEffect, useRef } from "react";
import "./CoffeeBot.css";
import ReactMarkdown from "react-markdown";
import { useCoffeeBot } from "../../context/CoffeeBotContext";

const CoffeeBot = () => {
  const { isOpen: open, toggleCoffeeBot, closeCoffeeBot } = useCoffeeBot();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi ☕ I'm your Coffee Buddy! Tell me your mood and budget 😊",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  // 1. Session Management
  // Store session_id in a ref so it doesn't change on re-renders
  const sessionIdRef = useRef(`user_${Math.random().toString(36).substring(7)}`);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Show welcome message on mount
  useEffect(() => {
    setShowWelcome(true);
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // 1. Add User Message immediately
    const userText = input;
    const userMessage = { sender: "user", text: userText };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 2. Prepare for Streaming Response
      // Add an empty "bot" message now, which we will fill chunk-by-chunk
      setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

      const res = await fetch(`${import.meta.env.VITE_API_BASE}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          session_id: sessionIdRef.current, // Send persistent session ID
        }),
      });

      if (!res.body) throw new Error("No response body");

      // 3. Set up the Stream Reader
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        // Optional: only re-render when a newline arrives
        if (!buffer.endsWith("\n") && !buffer.endsWith("•")) continue;
        // 🔧 Fix broken number / word splits
        buffer = buffer.replace(/₹\s*\n\s*(\d+)/g, "₹$1");
        buffer = buffer.replace(/(\w)\n(\w)/g, "$1 $2");
        // Update UI in controlled batches
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          newMessages[lastIdx] = {
            ...newMessages[lastIdx],
            text: buffer,
          };
          return newMessages;
        });
      }

    } catch (error) {
      console.error("Streaming error:", error);
      // If error, replace the empty bot message with error text
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        
        // Remove the empty message we added earlier if it's still empty, or append error
        if (lastMsg.sender === "bot") {
             lastMsg.text = "Oops 😔 Something went wrong!";
        } else {
             newMessages.push({ sender: "bot", text: "Oops 😔 Something went wrong!" });
        }
        return newMessages;
      });
    }

    setLoading(false);
  };

  return (
    <>
      {/* Welcome Message Dropdown */}
      {showWelcome && (
        <div className="coffee-bot-welcome">
          <div className="welcome-content">
            <span className="welcome-icon">☕</span>
            <span className="welcome-text">Hi! I'm your Coffee Buddy. Click me to chat!</span>
          </div>
          <div className="welcome-arrow"></div>
        </div>
      )}

      {/* Floating Button */}
      <div className="coffee-bot-btn" onClick={toggleCoffeeBot}>
        ☕
      </div>

      {/* Chat Window */}
      {open && (
        <div className="coffee-bot-window">
          <div className="coffee-bot-header">
            Coffee Buddy ☕
            <span onClick={closeCoffeeBot}>✖</span>
          </div>

          <div className="coffee-bot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`msg ${msg.sender}`}>
                {/* Use whitespace-pre-wrap to preserve newlines from Gemini */}
                {/* <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span> */}
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            ))}
            {/* Show "Typing..." only while waiting for the first chunk */}
            {loading && messages[messages.length - 1]?.text === "" && (
               <div className="msg bot">Typing...</div>
            )}
            
            <div ref={chatEndRef}></div>
          </div>

          <div className="coffee-bot-footer">
            <input
              type="text"
              placeholder="I'm tired, budget 150..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CoffeeBot;