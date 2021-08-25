import { Box, Button, Center, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useFirestore } from 'reactfire';
import { RouteComponentProps } from '@reach/router';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useContext } from 'react';
import { RtcContext } from '../App';


const Room = (props: RouteComponentProps) => {
  const isHost: boolean = !!props.location?.state?.host;
  const firestore = useFirestore();
  const pc = useContext(RtcContext);
  const ref = useRef<any>(null);
  const [roommates, setRoommates] = useState<any[]>([]);

  useEffect(() => {
    return () => console.log('unmount');
  }, []);

  useEffect(async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
    ref.current.srcObject = localStream;

    pc.ontrack = (event) => {
      setRoommates(event.streams.map((stream) => stream.getTracks()));
    };

    const callDoc = firestore.collection('calls').doc(props.id);
    const offerCandidates = callDoc.collection('offerCandidates');
    const answerCandidates = callDoc.collection('answerCandidates');

    if (isHost) {
      // Get candidates for caller, save to db
      pc.onicecandidate = (event) => {
        event.candidate && offerCandidates.add(event.candidate.toJSON());
      };

      // Create offer
      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };

      await callDoc.set({ offer });

      // Listen for remote answer
      callDoc.onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (data?.answer) {
          if (!pc.currentRemoteDescription) {

            const answerDescription = new RTCSessionDescription(data.answer);
            pc.setRemoteDescription(answerDescription);

          } else {
            pc.setRemoteDescription(data?.answer);
          }
        }
      });

      // When answered, add candidate to peer connection
      answerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });
    } else {

      pc.onicecandidate = (event) => {
        event.candidate && answerCandidates.add(event.candidate.toJSON());
      };

      const callData: any = (await callDoc.get()).data();

      const offerDescription = callData.offer;
      await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await callDoc.update({ answer });

      answerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const candidate = new RTCIceCandidate(change.doc.data());
            pc.addIceCandidate(candidate);
          }
        });
      });

      offerCandidates.onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    }
  }, [])

  return <Stack direction='column' alignItems='center'>
    <Text> room {props.id}</Text>
    <Stack direction='row'>
      <Box>
        <video ref={ref} autoPlay playsInline width='100%' height='100%'></video>
      </Box>
      {roommates.map((peer, i) => <Roommate key={i} roomData={peer} />)}
    </Stack>
  </Stack >
}

const Roommate = (props: { roomData: any }) => {
  const { roomData } = props;
  const ref = useRef<any>(null);

  useEffect(() => {
    const remoteStream = new MediaStream();
    roomData.forEach((track: any) => {
      remoteStream.addTrack(track);
    })

    ref.current.srcObject = remoteStream;

  }, [roomData])

  return <Box>
    <video ref={ref} autoPlay playsInline width='100%' height='100%'></video>
  </Box>
}

export default Room;