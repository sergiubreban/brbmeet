import { ColorModeScript } from "@chakra-ui/react"
import * as React from "react"
import ReactDOM from "react-dom"
import { FirebaseAppProvider } from "reactfire"
import 'firebase/firestore'
import firebaseConfig from './firebase.json';
import { App } from "./App"

ReactDOM.render(
  <React.StrictMode>
    <ColorModeScript />
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <App />
    </FirebaseAppProvider>
  </React.StrictMode>,
  document.getElementById("root"),
)
