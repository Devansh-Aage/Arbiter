// import { Socket } from "socket.io";
// import z from "zod";
// import { addVoteValidation } from "@arbiter/common/src/zodWsSchemas";
// import { ADD_VOTE_RES } from "@arbiter/common/src/eventConstants";


// type addVotePayload = z.infer<typeof addVoteValidation>

// export const addVote = async (socket: Socket, rawPayload: addVotePayload) => {
//     try {
//         const dataValidation = addVoteValidation.safeParse(rawPayload);
//         if (!dataValidation.success) {
//             console.error(dataValidation.error?.issues);
//             socket.emit(ADD_VOTE_RES, "Invalid Payload!");
//             return;
//         }
//         const user = socket.data.user;
//         if (!user) {
//             console.error("User not found!");
//             socket.emit(ADD_VOTE_RES, "User not found!");
//             return;
//         }
//         const userId = user.id;
//         const { choiceId, proposalId, signature, hash } = dataValidation.data;


//     } catch (error) {
//         console.error("Error while adding vote: ", error);
//         if (process.env.NODE_ENV !== "production") {
//             socket.emit("error", error);
//         } else {
//             socket.emit("error", "Something went wrong! Try again after some time");
//         }
//     }
// }