import React from 'react';

function Contact(props) {
    return (
        <div className="contact-item" id={props.contactID} onClick={props.onClick}>
            <img className="avatar" src={props.avatarURL} />
            <h1 className="contact-name">{props.contactName}</h1>
        </div>
    )
}

export default Contact