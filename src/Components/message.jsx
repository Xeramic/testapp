import React from 'react';

function Message(props) {
    return (
        <div className="message-item">
            <p id='author'>{props.author}</p>
            <p id='content'>{props.content}</p>
            <p id='date'>{props.date}</p>
        </div>
    )
}

export default Message