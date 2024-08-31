import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import './Chat.css';

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const senderName = window.location.port === '3000' ? 'Sender 1' : 'Sender 2';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('http://localhost:5000/messages');
        const data = await response.json();
        setMessages(data.filter(msg => msg !== null));
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    socket.on('message', (message) => {
      if (message !== null) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    return () => {
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage) {
      try {
        const messageData = { content: newMessage, username: senderName };
        const response = await fetch('http://localhost:5000/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(messageData),
        });

        if (response.ok) {
          setNewMessage('');
        } else {
          console.error('Failed to send message. Status:', response.status);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date)
      ? date.toLocaleString()
      : 'Invalid Date';
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Real-Time Chat App</h1>
      </header>
      <div className="chat-container">
        <div className="message-list">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.username === senderName ? 'sender-me' : 'sender-other'}`}
            >
              <strong>{msg.username || 'Unknown'}</strong>: {msg.content || 'No message'}
              <span className="timestamp">{formatDate(msg.createdAt)}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
      <footer className="app-footer">
        <p>Made by @Shreya Ojha</p>
      </footer>
    </div>
  );
};

export default Chat;