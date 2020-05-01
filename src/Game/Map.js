import React, { useState, useRef, useEffect, useContext } from "react";
import { axiosWithAuth } from "../Components/Utils/AxiosWithAuth";
import Room from "./DrawRoom";
import { Container, Row, Col } from "reactstrap";
import { UserContext } from "../Components/Contexts/UserContext";
import { PlayerContext } from "../Components/Contexts/PlayerContext";
import '../index.css';
import useEventListener from '@use-it/event-listener';
import Controls from "./Controls";

function Map() {
	const [currentRoom, setCurrentRoom] = useState(null)
	const [isFetching, setIsFetching] = useState(null)
	const [rooms, setRooms] = useState(null)
	const { user, setUser } = useContext(UserContext)
	const { players, setPlayers } = useContext(PlayerContext)
	let canvasRef = useRef(null)
	let ctx;

	useEffect(() => {
		if ( rooms == null ) {
			axiosWithAuth()
				.get("https://cs28mud.herokuapp.com/api/adv/rooms/")
				.then(res => {
					const rooms = res.data.grid
					setRooms(rooms)
				})
				.catch(err => {
					console.log(err)
				})
		}
	}, [rooms, setRooms])

	useEffect(() => {
		if ( rooms != null ) {
			drawRooms(rooms)
		}
	}, [drawRooms, handler]);

	useEventListener('keydown', handler)

    function handler({ key }) {
        let move = new Controls(key)
        //console.log(move)
        //axios call to move rooms
        axiosWithAuth().post('/adv/move/', {"direction": `${move.dir}`})
        .then(res => {
        	console.log("direction", res.data)
            if(res.data.title !== user.title){
                setUser({
                    ...user,
                    title: res.data.title,
                    description: res.data.description,
                    room_id: res.data.room_id
                    error_msg: ''
                })
                setPlayers(res.data.players)
                drawRooms(rooms)
            }else{
                setUser({
                    ...user,
                    error_msg: 'You are blocked from moving that direction'
                })
            }
        })
        .catch(err => console.log(err))
    }

	function drawRooms(rooms) {
		ctx = canvasRef.current.getContext('2d');
		ctx.clearRect(0, 0, 400, 400)
		let canvas_width = ctx.canvas.clientWidth
		let canvas_height = ctx.canvas.clientHeight

		console.log(rooms)

		rooms.map(room => {
			let r = new Room(room.id, 
					room.title,
					room.description, 
					room.n_to, 
					room.s_to, 
					room.e_to, 
					room.w_to,
					room.x, room.y
			)
			return r.draw(ctx, user.room_id)
		})
	}

	// function gameLoop(timestamp) {
	// 	let deltaTime = timestamp - lastTime;
	// 	lastTime = timestamp
	// 	ctx.clearRect(0, 0, 400, 400);
	// 	room.update(deltaTime)
	// 	room.draw(ctx)

// 	// 	requestAnimationFrame(gameLoop);
// 	// }

	return (
		<Container>
			<Row>
				<Col>
				<canvas ref={canvasRef} width="720" height="480" className="canvas" />
				</Col>
			</Row>
		</Container>
	)
}

export default Map;