import {
    ADD_VOTE_REQ
} from "@arbiter/common/src/eventConstants";
import { Socket } from "socket.io";
import { addVote } from "../controller/VoteController";

export const voteRoutes = (socket: Socket) => {
    socket.on(ADD_VOTE_REQ, (data) => addVote(socket, data));
};