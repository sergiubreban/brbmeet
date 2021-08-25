import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  Flex,
  Button,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Router } from "@reach/router"
import HomeDashboard from "./components/HomeDashboard"
import Room from "./components/Room"
import { createContext } from "react"
import { navigate } from '@reach/router';

const servers = {
  iceServers: [{
    urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
  },],
  iceCandidatePoolSize: 10,
};
const pc = new RTCPeerConnection(servers);
export const RtcContext = createContext(pc);

pc.addEventListener("iceconnectionstatechange", event => {
  console.log({event}, pc.iceConnectionState)
  if (pc.iceConnectionState === "failed") {
    /* possibly reconfigure the connection in some way here */
    /* then request ICE restart */
    pc.restartIce();
  }
});

export const App = () => (
  <ChakraProvider theme={theme}>
    <RtcContext.Provider value={pc}>
      <Box textAlign="center" fontSize="xl">
        <Flex direction='row-reverse' p='10px'>
          <ColorModeSwitcher justifySelf="flex-end" />
          <Button variant='outline' onClick={() => navigate('/')}>Home</Button>
        </Flex>
        <Grid minH="90vh">
          <Router>
            <HomeDashboard path="/" />
            <Room path="/room/:id" />
          </Router>
        </Grid>
      </Box>
    </RtcContext.Provider>
  </ChakraProvider>
)
