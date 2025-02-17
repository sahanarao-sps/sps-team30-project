// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

// This function takes in a string (data) and returns it's
// translated value in english.
// It uses a POST request to /translate servlet
async function postTranslate(data) {
  // source languge from dropdown
  const sourceLanguage = document.getElementById("choose-language").value;

  const params = {
    data: data,
    sourceLanguage: sourceLanguage,
  };

  // POST Request
  const response = await fetch("/translator", {
    method: "POST", // Send Post Request to /translate
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  // Translated value from POST response
  const translatedText = await response.text();

  return translatedText;
}

// This function takes in a string (data) and returns it's
// sentiment value from -1 to 1.
// It uses a POST request to /sentiment servlet
async function postSentiment(data) {
  // POST Request
  const response = await fetch("/sentiment", {
    method: "POST", // Send Post Request to /sentence
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // Sentiment score from POST response
  const sentimentScore = await response.text();

  return sentimentScore;
}

// Creates a <p> element containing text.
function createParagraphElement(text) {
  const pElement = document.createElement("p");
  pElement.innerText = text;
  return pElement;
}

// displays our loading bar to the sentimentBarGraph div
function displayLoadingBar(sentimentScore) {
  document.getElementById("sentimentBarGraph").style.display = "";

  const sentimentPercentage = ((parseFloat(sentimentScore) + 1) / 2) * 100;
  let i = 0;
  if (i == 0) {
    i = 1;
    let elem = document.getElementById("sentimentBarGraph");
    let width = 0;
    let score = -1;
    let id = setInterval(frame, 20);
    function frame() {
      if (width >= sentimentPercentage) {
        clearInterval(id);
        i = 0;
      } else {
        width++;
        score = score + 0.02;
        elem.style.width = width + "%";
        elem.innerHTML = score.toFixed(2);
        elem.appendChild(getEmoji(width));
      }
    }
  }
}

// This function returns a message based on sentiment scores
function getScoreResponse(score) {
  // Messages based on score ranges
  const positiveMessages = [
    "Liking the positive energy!!",
    "That should make someone smile.",
    "That was nice to hear. Which means 'consume from standard input.' in robot.",
  ];
  const neutralMessages = [
    "Congrats, You achieved a neutral response",
    "This text shouldn't ruffle any feathers.",
    "You're like the swiss, Neutral.",
  ];
  const negativeMessages = [
    "Congrats, this text is sort-of negative. If you meant it.",
    "Sometimes you need to get a somber tone across.",
    "Did you hear about the mathematician that was afraid of negative numbers?\n He'll stop at nothing to avoid them.",
  ];

  // generates random index from 0 --> 2
  const randomIndex = Math.round(Math.abs(Math.random() * 3 - 1));
  /*
   * ranges:
   *        -1 upto -0.2  ==> negative
   *        -0.2 to 0.2 ==> neutral
   *        0.2 upto 1    ==> postive
   * */
  if (score > 0.2) {
    return positiveMessages[randomIndex];
  } else if (score < -0.2) {
    return negativeMessages[randomIndex];
  } else {
    return neutralMessages[randomIndex];
  }
}

// returns emoji based on sentiment score
function getEmoji(width) {
  const spanElem = document.createElement("span");
  spanElem.className = "emoji";
  if (width <= 10) {
    spanElem.innerText = "";
  } else if (width <= 40) {
    spanElem.innerText = "😒";
  } else if (width >= 70) {
    spanElem.innerText = "😺";
  } else {
    spanElem.innerText = "😐";
  }

  return spanElem;
}

// Gets a sentiment value and updates DOM with new element.
async function getSentiment() {
  // Depends on where our value is stored in our index.html
  const userMessage = document.getElementById("user-message").value;

  // Gets our translated message from /translate servlet
  const translatedMessage = await postTranslate(userMessage);

  // Gets our sentiment score from /sentiment servlet
  const sentimentScore = await postSentiment(translatedMessage);

  // This displays our sentimentScore, userMessage and translatedMessage
  displayElements(sentimentScore, userMessage, translatedMessage);
}

// This function displays sentimentScore, originalMessage, scoreResponse, and
// translatedMessage to the "sentiment" div.
function displayElements(sentimentScore, originalMessage, translatedMessage) {
  // Depends on the element id used to display our sentiment
  const sentimentContainer = document.getElementById("sentiment");
  sentimentContainer.innerText = "";

  // Displays sentiment score
  sentimentContainer.appendChild(
    createParagraphElement("Sentiment score: " + sentimentScore)
  );

  // Displays a message based on our sentiment score
  sentimentContainer.appendChild(
    createParagraphElement(getScoreResponse(parseFloat(sentimentScore)))
  );

  // Displays user messsage
  sentimentContainer.appendChild(
    createParagraphElement("Original Message: " + originalMessage)
  );

  // Displays translated Message
  sentimentContainer.appendChild(
    createParagraphElement("Translated Message: " + translatedMessage)
  );

  displayLoadingBar(sentimentScore);
}
