import React from 'react';


/**
 * This class represents a React Component responsible for rendering the part of the UI where users can request 
 * Pokemon names to be generated. 
 * 
 * @class @public 
 */
class LanguageModel extends React.Component {
    constructor(props) {
        super(props); 
        this._generateNewName = this._generateNewName.bind(this); 
        this._resetLM = this._resetLM.bind(this); 
        this._sendRequestForNames = this._sendRequestForNames.bind(this); 
        this._validateInputs = this._validateInputs.bind(this); 
    }

    componentDidMount() {
        this._addClassesLabels(document.getElementById('tempLabel'), document.getElementById('numGenerateLabel'));
        this._addHTML_tempLabel();
        this._addHTML_numLabel();
    }

    /**
     * This function accepts a variable number of input arguments, each of which should be a DOM node, and will 
     * remove all the classes from each of the DOM nodes and then add a class called formLabel to them. 
     * @param  {HTMLElement[]} args 
     */
    _addClassesLabels(...args) {
        for (let arg of args) {
            arg.className = '';
            arg.classList.add('formLabel');
        }
    }

    /**
     * This function provides a description for the label of the temperature input tag 
     */
    _addHTML_tempLabel() {
        document.getElementById('tempLabel').innerHTML = `Provide a value between 0.5 and 5. The higher
        the number the more random the names:`;
    }

    /**
     * This function provides a description for the label of the number of names to generate input tag  
     */
    _addHTML_numLabel() {
        document.getElementById('numGenerateLabel').innerHTML = `Pick a number of names to generate between 1 and 15 (inclusive)!`;
    }

    
    /**
     * This function is an asynchronous function that acts as the event listener for an onclick event when 
     * the user clicks to generate new names. If the inputs are valid, this function will send an HTTP request
     * to the server and if everything goes correctly, the generated names will be shown to the user. Otherwise, 
     * an error will be shown to the user. 
     * 
     * @param {object} e Event object 
     * @listens onClick 
     */
    async _generateNewName(e) {
        e.preventDefault(); 
        const temperatureInputNode = document.getElementById('temperatureVal');
        const tempLabelNode = document.getElementById('tempLabel');
        const numNamesInputNode = document.getElementById('numGenerateInput');
        const numberNamesLabelNode = document.getElementById('numGenerateLabel'); 
        const LM_ModelDiv = document.getElementById("LM_ModelDiv");
        const LanguageModelDiv = document.getElementById("temperatureForm");
        const resultsLM = document.getElementById("ResultsLanguageModel");

        // validate the inputs and make sure they are in an acceptable range 
        if (this._validateInputs(temperatureInputNode, tempLabelNode, numNamesInputNode, numberNamesLabelNode)) {
            return; 
        }
        // regardless of if we get an error or not here, reset whatever is currently in the results div
        // because something new will be placed in there
        resultsLM.innerHTML = ''; 

        try {
            await this._sendRequestForNames(LM_ModelDiv, temperatureInputNode, numNamesInputNode, resultsLM); 
        }
        catch(err) {
            resultsLM.innerHTML = "Sorry, there was an error getting your new pokémon name. Try again?";
            this.props._showDisplays('block', resultsLM, document.getElementById('generateAgain'));
        }

        finally {
            this.props._showDisplays('block', document.getElementById('generateAgain'));
            LM_ModelDiv.removeChild(LM_ModelDiv.lastChild); 
        }
    }

    /**
     * This function sets the grid style of the results holder according to the number of names that were generated. 
     * @param {HTMLElement} resultsLM DOM node that represents a div holding the results of the language generation 
     * @param {Number} numberGenerated Integer representing the number of names generated 
     */
    _setGridDisplayResults(resultsLM, numberGenerated) {
        const numberRows = Math.ceil(numberGenerated/3);
        resultsLM.style.display = 'grid'; 
        resultsLM.style.gridTemplateColumns = 'repeat(3,minmax(100px, 1fr))';
        resultsLM.style.gridTemplateRows = `repeat(${numberRows}, minmax(30px, 50px))`; 
    }

    /**
     * This function wraps each name recieved from the server in a div and then adds the divs to a result holder. 
     * @param {HTMLElement} resultsLM DOM node that represents a div holding the results of the language generation 
     * @param {Number} predictedNames Integer representing the number of names generated
     */
    _addNodesToResultsLM(resultsLM, predictedNames) {
        for (let name of predictedNames) {
            const nameDiv = document.createElement('div');
            nameDiv.innerHTML = name;
            resultsLM.appendChild(nameDiv); 
        }
    }

    /**
     * This function is an asynchronous function that sends a HTTP request to the server to obtain the desired number 
     * of pokemon names. If succesful, the names are added to a results container and styled appropriately
     * @param {HTMLElement} LM_ModelDiv Div containing the DOM nodes related to the language model  
     * @param {HTMLElement} temperatureInputNode DOM node representing the input tag for the temperature
     * @param {HTMLElement} numNamesInputNode DOM node representing the input tag for the number of names to generate
     * @param {HTMLElement} resultsLM DOM node representing the div holding the results recieved from the server
     */
    async _sendRequestForNames(LM_ModelDiv, temperatureInputNode, numNamesInputNode, resultsLM) {
        this.props._hideDisplays(document.getElementById('temperatureForm')); 
        LM_ModelDiv.appendChild(this.props._addSpinnerAsync());

        let fetchedData = await fetch('/languageModel', {
            method: 'POST',
            body: JSON.stringify({
                temperature: temperatureInputNode.value,
                number_to_generate: numNamesInputNode.value 
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8'
            }
        });

        let jsonData = await fetchedData.json();
        let predictedNames = jsonData.predictedName; 
        if (!predictedNames) {
            resultsLM.innerHTML = "Sorry, there was an error getting your new pokémon name. Try again?";
            this.props._showDisplays('block', resultsLM);
            return;
        }
        else if (predictedNames.length === 1) {
            resultsLM.innerHTML = predictedNames[0];
            this.props._showDisplays('block', resultsLM);
            return; 
        }
        this._addNodesToResultsLM(resultsLM, predictedNames); 
        this._setGridDisplayResults(resultsLM, predictedNames.length);
    }


    /**
     * This function validates the users inputs for the temperature and the number of names to generate
     * @param {HTMLElement} temperatureInputNode DOM node representing the input tag for the temperature
     * @param {HTMLElement} tempLabelNode DOM node representing the label of the input tag for the temperature
     * @param {HTMLElement} numNamesInputNode DOM node representing the input tag for the number of names to generate
     * @param {HTMLElement} numberNamesLabelNode DOM node representing the label of the input tag for the number of names to generate
     * 
     * @returns {Boolean} Boolean representing whether the user passed acceptable inputs or not 
     */
    _validateInputs(temperatureInputNode, tempLabelNode, numNamesInputNode, numberNamesLabelNode) {
        if (this._validateInputsHelper(0.5, 5,temperatureInputNode, tempLabelNode)) {
            return true; 
        }
        else {
            this._addClassesLabels(tempLabelNode); 
            this._addHTML_tempLabel(); 
        }
        if (this._validateInputsHelper(1, 15, numNamesInputNode, numberNamesLabelNode, false)) {
            return true; 
        }
        else {
            this._addClassesLabels(numberNamesLabelNode); 
            this._addHTML_numLabel(); 
        }

        return false; 
    }

    /**
     * Helper function for validating the inputs for the language model that ensures that the given input falls 
     * between a given min value and max value
     */
    _validateInputsHelper(minVal, maxVal, inputNode, labelNode, temperatureInput = true) {
        const value = inputNode.value; 
        if(value>maxVal || value <minVal ) {
            const validation_value_msg = value ? `${value} does not meet those conditions `:`no value was provided at all!`;
            labelNode.innerHTML = `**Value must be a number between ${minVal} and ${maxVal}, and ${validation_value_msg}`;
            labelNode.className = '';
            labelNode.classList.add('validationErrorLabel');
            return true; 
        }
        // can't pass a floating value in when specifying number of names to generate 
        else if (!temperatureInput && value%1 !== 0) {
            labelNode.innerHTML = `**Please pass an integer between 1 and 15`
            labelNode.className = '';
            labelNode.classList.add('validationErrorLabel');
            return true; 
        }
        return false; 
    }
    

    /**
     * This function resets the language model to its original state when the user wants to generate new names. 
     */
    _resetLM() {
        const resultsLM = document.getElementById("ResultsLanguageModel");
        this.props._showDisplays('flex',document.getElementById('temperatureForm'));
        this.props._hideDisplays(resultsLM, document.getElementById('generateAgain')); 
        // reset the temperature val to be nothing, and reset the string in the label to be the original string because 
        // there may still be an error message displayed there 
        document.getElementById('temperatureVal').value = '';
        document.getElementById('numGenerateInput').value = '';
        this._addClassesLabels(document.getElementById('numGenerateLabel'));
        // this._addHTML_numLabel();
    }

   
    render() {
        return(
            <div className = "Model_Div" id = "LM_ModelDiv">
                <div id = "ResultsLanguageModel"></div>
                <form id = "temperatureForm">
                    <label htmlFor = "temperature" id = "tempLabel">Temperature:</label>
                    <input aria-label = "user input for temperature value" type = "number" id = "temperatureVal" className = "formInputNumber" name = "temperature" min = "0.5" max = "5" step = "any"></input>
                    <label htmlFor = "numGenerate" id = "numGenerateLabel"></label>
                    <input aria-label = "user input for number names to generate" type = "number" name = "numGenerate" className ="formInputNumber" id = "numGenerateInput" min = "1" max = "15" step = "1"></input>
                    <input type= "submit" className = "button" id = "submitLM" onClick = {this._generateNewName} value = "Generate!"></input>
                </form>
                <div id = "generateAgain" className = "button" onClick = {this._resetLM}>Generate Again</div>
            </div>
        );
    }
}

export default LanguageModel; 