// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
const categoryNum = 6;
const questions = 5;

async function randomArray(arr, num) {  //should return a random array from an array of any length, the length = num
    let randomArr =[];

    for ( let i = 0; i < num; i++) {
        let tempArr = arr[Math.floor(Math.random()*arr.length)];
        randomArr.push(tempArr);
    }
    return randomArr;
}

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    const response = await axios.get("https://jservice.io/api/categories?count=100");
    const categoryIds = await response.data.map(category => category.id);
    return randomArray(categoryIds, 6);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    const response = await axios.get('https://jservice.io/api/categories', { params: { id: `${catId}` } });
    const category = response.data;
    const question = category.clues;
    const randomQuestions = await randomArray(question, questions);
    const gameQuestions = randomQuestions.map(cat => ({
        question: cat.question,
        answer: cat.answer,
        showing: null
    }));
    return { title: category.title, clues: gameQuestions };
};

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() { //launch at start
    $("jeopardy thead").empty();
    const $tr = $('<tr>'); //creates table row for thead for titles
    for(let i = 0; i < categoryNum; i++){ //iterate over the 6 categories. 
        $tr.append($("<th>").text(categories[i].title)); //titles each TH using category array
    }
    $("#jeopardy thead").append($tr);
    $("#jeopardy tbody").empty();  //resets table at start
    for(let y = 0; y < questions; y++) {
        let $tr = $("<tr>");
        for(let x =0; x < catergoyNum; x++){
            $tr.append($("<td>").attr("id", `${x}-${y}`).text("?"));  //gives cell an ID attribute and makesthe text a question mark. 
        }
    }

}

/** Handle clicking on a clue: show the question or answer.
 *
 * 
 * - if currently "question", show answer & set .showing to "answer"
 
 * */

function handleClick(evt) {
    const id = evt.target.id;
    const [categoryId, questionId] = id.split('-');
    const question = categories[categoryId].questions[questionId];
    let text;

    if (!question.showing) { //if currently null, show question & set .showing to "question"
      text = question.question;
      question.showing = "question"; //Uses .showing property on clue to determine what to show:
    } else if (question.showing === "question") {
      text = question.answer;
      question.showing = "answer";
    } else { //* - if currently "answer", ignore click
      return
    }
  
    // Update text of cell
    $(`#${catId}-${clueId}`).html(msg);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {

}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    const response = await getCategoryIds();
    categories=[];
    for(let i = 0; i < response.length; i++) {
        categories.push(await getCategory(response));
    }
    fillTable();
}

/** On click of start / restart button, set up game. */
$("#restart").on("click", setupAndStart);


/** On page load, add event handler for clicking clues */
$(async function(){
    setupAndStart();
    $("#jeopardy").on('click', handleClick)
    
});
