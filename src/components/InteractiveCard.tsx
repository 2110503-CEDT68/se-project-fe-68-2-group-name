'use client'
import React from "react";

export default function InteractiveCard( {children, contentName}: {children: React.ReactNode, contentName:string}) {

    function onCardSelected() {
        console.log("You Selected " + contentName)
        // alert("You Selected " + contentName)
    }

    function onCardMouseAction(event: React.SyntheticEvent) {
        if(event.type=='mouseover'){
            event.currentTarget.classList.remove('shadow-lg')
            event.currentTarget.classList.add('shadow-2xl')
        }else{
            event.currentTarget.classList.remove('shadow-2xl')
            event.currentTarget.classList.add('shadow-lg')
        }
    }

    return (
        <div className='w-[300px] h-[400px] rounded-lg shadow-lg !mx-2' 
        onMouseOver={(e)=> onCardMouseAction(e)}
        onMouseOut={(e)=> onCardMouseAction(e)}
        >
            {children}
        </div>
    );
}