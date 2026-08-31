import React, {JSX, useState} from 'react';
import {socketService} from "../../services/socket-service";

function SocketTest(): JSX.Element {

    const [randomNumber, setRandomNumber] = useState<number>(0);

    function getRandomNumber(randomNumber: number) {
        setRandomNumber(randomNumber);
    }

    socketService.connect(getRandomNumber);


    return (
        <div className="SocketTest">
            <h1>Socket Test</h1>
            <h1>{randomNumber}</h1>
        </div>
    );
}

export default SocketTest;
