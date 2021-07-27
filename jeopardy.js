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


const categoryNum = 6;
const questions = 5;
let categories = [];

/* function randomArray(arr, num) {  //should return a random array from an array of any length, the length = num
    let randomArr =[];

    for ( let i = 0; i < num; i++) {
        let tempArr = arr[Math.floor(Math.random()*arr.length)];
        randomArr.push(tempArr);
    }
    return randomArr;
}*/

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    //ask for maximum categorys to randomly pick from
    const response = await axios.get(`https://jservice.io/api/categories?count=100`);
    const catIds = response.data.map(c => c.id);
    // return random categories(categoryIds, 6);
    return _.sampleSize(catIds, categoryNum);
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
    let response = await axios.get(`https://jservice.io/api/category?id=${catId}`);
    let category = response.data;
    let question = category.clues;
    let randomQuestions = _.sampleSize(question, questions);
    //const randomQuestions = await randomArray(question, 5);    
    let gameQuestions = randomQuestions.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null
    }));
    return { title: category.title, gameQuestions };
};

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

 async function fillTable() {
    // Add row with headers for categories
    $("#jeopardy thead").empty();
    let $tr = $("<tr>");
    for (let catIdx = 0; catIdx < categoryNum; catIdx++) {
      $tr.append($("<th>").text(categories[catIdx].title));
    }
    $("#jeopardy thead").append($tr);
  
    // Add rows with questions for each category
    $("#jeopardy tbody").empty();
    for (let clueIdx = 0; clueIdx < questions; clueIdx++) {
      let $tr = $("<tr>");
      for (let catIdx = 0; catIdx < categoryNum; catIdx++) {
        $tr.append($("<td>").attr("id", `${catIdx}-${clueIdx}`).text("?"));
      }
      $("#jeopardy tbody").append($tr);
    }
  }

/** Handle clicking on a clue: show the question or answer.
 *
 * 
 * - if currently "question", show answer & set .showing to "answer"
 
 * */

 function handleClick(evt) {
    let id = evt.target.id;
    let [catId, clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];
  
    let msg;
  
    if (!clue.showing) {
      msg = clue.question;
      clue.showing = "question";
    } else if (clue.showing === "question") {
      msg = clue.answer;
      clue.showing = "answer";
    } else {
      // already showing answer; ignore
      return
    }
  
    // Update text of cell
    $(`#${catId}-${clueId}`).html(msg);
  }


/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

 async function setupAndStart() {
    const response = await getCategoryIds();
    categories = [];
    for (let i = 0; i < response.length; i++) {
      categories.push(await getCategory(response));
    }
    fillTable();
  }

/** On click of start / restart button, set up game. */
$("#restart").on("click", setupAndStart);


/** On page load, add event handler for clicking clues */
$(async function () {
    setupAndStart();
    $("#jeopardy").on("click", handleClick);
});
