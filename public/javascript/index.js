import React from 'react'
import { render } from 'react-dom'
import App from './../../client/App'
import Game from './../../client/Game'
import Home from './../../client/Home'

let registeredComponents = [App, Game, Home];

for (let i in registeredComponents) {
  let C = registeredComponents[i];
  let dElement = document.getElementById(C.name)
  if (dElement) {
    render(<C />, dElement);
  }
}
