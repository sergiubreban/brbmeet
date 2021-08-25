import { Button, Center } from '@chakra-ui/react';
import React from 'react';
import { useFirestore } from 'reactfire';
import { navigate, RouteComponentProps } from '@reach/router';
import { useContext } from 'react';
import { RtcContext } from '../App';

const HomeDashboard = (props: RouteComponentProps) => {
  const firestore = useFirestore();
  const pc = useContext(RtcContext);

  const handleCreateRoom = async () => {
    const callDoc = firestore.collection('calls').doc();
    const offerCandidates = callDoc.collection('offerCandidates');
   
    navigate(`/room/${callDoc.id}`, { state: { host: true } });
  }

  return <Center height='100%'>
    <Button onClick={handleCreateRoom} variant='outline'>Create new meeting</Button>
  </Center>
}

export default HomeDashboard;