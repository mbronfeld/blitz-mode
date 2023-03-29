import ButtonArray from './ButtonArray';
import React from 'react';
import OpButtonArray from './OpButtonsArray';
import ChosenButtonArray from './ChosenButtonArray';
import GameStateButtonContainer from './GameStateButtonContainer';

const operations = [
  {text: "+", id: "1"},
  {text: "−", id: "2"},
  {text: "×", id: "3"},
  {text: "÷", id: "4"},
];

function GameUI({list_of_buttons, target_list, changeScore, score, getNumbers, getButtons, getTarget, startingButtons, startingTarget}) {

  const checkWinCondition = (bottomNumberButtons) => {
    const targetButton = bottomNumberButtons.filter((button) => button.visible)
    if (targetButton.length === 1) {
      if (targetButton[0].text === target) {
        const newSolved = score + 1
        const newNumbers = getNumbers()
        const newButtons = getButtons(newNumbers)
        const newTarget = getTarget(newNumbers)
        setBottomNumberButtons(copyButtons(newButtons))
        setTarget(newTarget)
        setLastState([])
        changeScore();
      }
    }
  }
  
  const undo = () => {
    console.log('UNDOING')
    const temp = copyButtons(lastState[lastState.length - 1])
    //
    setBottomNumberButtons(temp)
    setLastState(lastState.slice(0, lastState.length - 1))
    setTopLeftNumberButton(null)
    setTopRightNumberButton(null)
    setTopOpButton(null)
  }

  const copyButtons = (buttons, forceVisible=false) => {
    let newButtons = []
    //console.log(buttons)
    buttons.forEach((elem) => {
      const visible = forceVisible || elem.visible
      const toBeAdded = {text: elem.text, id: elem.id, visible: visible}
      newButtons = [...newButtons, toBeAdded]
    });
    return newButtons
  }

  const reset = () => {
    const temp = copyButtons(lastState[0])
    setBottomNumberButtons(temp)
    setLastState(lastState.slice(0, 0))
    setTopLeftNumberButton(null)
    setTopRightNumberButton(null)
    setTopOpButton(null)
  }
  
  const [target, setTarget] = React.useState(startingTarget)
  const [bottomNumberButtons, setBottomNumberButtons] = React.useState(startingButtons);
  const [topLeftNumberButton, setTopLeftNumberButton] = React.useState();
  const [topRightNumberButton, setTopRightNumberButton] = React.useState();
  
  const [bottomOpButtons, setBottomOpButton] = React.useState(operations);
  const [topOpButton, setTopOpButton] = React.useState();

  const [lastState, setLastState] = React.useState([]);

  const pushLastState = React.useCallback((bottomNumberButtons) => {
      console.log("nbnb : " , bottomNumberButtons)
      const temp = copyButtons(bottomNumberButtons, true)
      setLastState([...lastState, temp])
      console.log("new last state: " , lastState)
    }, [lastState]);

  const handleBottomNumberClick = React.useCallback((buttonID) => {
      if ((topLeftNumberButton) && (topRightNumberButton)) {
        return
      }
      if (topLeftNumberButton){
        console.log({buttonID})
        const clickedButton = bottomNumberButtons.find((button) => button.id === buttonID)
        clickedButton.visible = false;
        setTopRightNumberButton(clickedButton)
      }
      else {
        console.log({buttonID})
        const clickedButton = bottomNumberButtons.find((button) => button.id === buttonID)
        clickedButton.visible = false;
        setTopLeftNumberButton(clickedButton)
      }
      
  }, [bottomNumberButtons, topLeftNumberButton, topRightNumberButton]);
      
  const handleTopNumberClick = React.useCallback((buttonID) => {
    console.log({buttonID})
    if (topLeftNumberButton){
      if (buttonID === topLeftNumberButton.id) {
        topLeftNumberButton.visible = true;
        setTopLeftNumberButton(null)
        return
      }
    }
    topRightNumberButton.visible = true;
    setTopRightNumberButton(null)
  }, [bottomNumberButtons, topLeftNumberButton, topRightNumberButton]);

  const handleBottomOpClick = React.useCallback((opID) => {
    console.log({opID})
    const op = bottomOpButtons.find((op) => op.id === opID);
    setTopOpButton(op);
  }, [bottomOpButtons, topOpButton]);

  const handleTopOpClick = React.useCallback((opID) => {
    console.log(opID)
    setTopOpButton(null)
  });

  const evaluate = React.useEffect(() => {
    if (topLeftNumberButton && topRightNumberButton && topOpButton) {
      const op = topOpButton.id;
      let result;
      const a = topLeftNumberButton.text
      const b = topRightNumberButton.text
      if (op === "1") {
          result =  a+b
      }
      else if (op === "2") {
          result = a-b
      }
      else if (op === "3") {
          result = a*b
      }
      else {
          if (b === 0) {
              return
          }
          result = parseFloat((a/b).toFixed(3))
          if (result % 1 === 0) {
            result = parseInt(result)
          }
      }
      pushLastState(bottomNumberButtons)
      const unusedButtons = bottomNumberButtons.filter((button) => button.id !== topLeftNumberButton.id && button.id !== topRightNumberButton.id)
      unusedButtons.push({text: result, id: topLeftNumberButton.id , visible: true})
      setBottomNumberButtons(unusedButtons)
      checkWinCondition(unusedButtons)
      setTopLeftNumberButton(null)
      setTopRightNumberButton(null)
      setTopOpButton(null)
    }
  }, [topLeftNumberButton, topRightNumberButton, topOpButton])

  

  return (
    <div className="game_ui">
      <GameStateButtonContainer lastState={lastState} undo={undo} reset={reset} target={target}/>
      <header className="game-board">
         <ChosenButtonArray numberButtons={[topLeftNumberButton, topRightNumberButton]}
                            operatorButton={[topOpButton]}
                            onNumberButtonClick={handleTopNumberClick}
                            onOperatorButtonClick={handleTopOpClick}/>
         <div className="lower-button-groups">
            <ButtonArray buttons={bottomNumberButtons} onButtonClick={handleBottomNumberClick}/>
            <OpButtonArray operations={bottomOpButtons} onButtonClick={handleBottomOpClick}/>
         </div>
      </header>
    </div>
  );
}

export default GameUI;