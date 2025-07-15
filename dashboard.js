import * as cb from "https://platinumblock.github.io/chillbase/chillbase.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVUe-NLwbFjPZSxFslfuUl4X-2Hzllo84",
  authDomain: "job-application-tracker-1e28f.firebaseapp.com",
  projectId: "job-application-tracker-1e28f",
  storageBucket: "job-application-tracker-1e28f.firebasestorage.app",
  messagingSenderId: "578567576764",
  appId: "1:578567576764:web:8d2c498ea3601c2cf284b9"
};


class App{
    constructor(company, date, decision, stages){
        this.company = company;
        this.date = date;
        this.decision = decision;
        this.stages = stages;
    }
}

var userID = localStorage.getItem("currentUser");

if(userID == null || userID == "null"){
    window.location.href = "signin.html";
}else{
    document.getElementById("headerWelcome").innerHTML = "Hello " + localStorage.getItem("currentUserName") + "!";
}

var months = {"january":0,"february":1,"march":2,"april":3,"may":4,"june":5,"july":6,"august":7,"september":8,"october":9,"november":10,"december":11};
var decisions = {"accepted":0,"withdrew":1,"rejected":2};


var appColors = {"Accepted":"#3DD647", "Withdrew":"#2991FF", "Rejected":"#FF4747"};
var statColors = {"Accepted":"#3DD647", "Withdrew":"#2991FF", "Rejected":"#FF4747","Application":"rgb(230,230,230)","First Round":"rgb(200,200,200)","Second Round":"rgb(170,170,170)"};


var sorts = {"Date":sortByDate, "Result":sortByResult, "Name":sortByName}
var currentSort = sortByDate;

var search = "";

var stats = [];


var statTypes = [
    ["Results Overview", resultsOverview], 
    ["All Results By Round", (event) => {resultsByRound(event, ["Accepted", "Withdrew", "Rejected"])}], 
    ["Acceptances By Round", (event) => {resultsByRound(event, ["Accepted"])}], 
    ["Withdraws By Round", (event) => {resultsByRound(event, ["Withdrew"])}], 
    ["Rejections By Round", (event) => {resultsByRound(event, ["Rejected"])}]
];

var currentStatType = "";

var editing = false;

var currentApp = null;
var currentAppIndex = -1;


cb.start(firebaseConfig);

// sample data: var myApps = [new App("1TCC", "January 2025", "Withdrew", [["Application", "sample"],["1st Round Interview", "sample"]]), new App("Intuition Labs", "May 2024", "Rejected", [["Application", "sample"]]), new App("MVPTMS", "May 2025", "Accepted", [["Application","sample"],["1st Round Interview","sample"]]), new App("REscan", "June 2025", "Accepted", [["Application","lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor lorem ipsum dolor "],["1st Round Interview","sample"],["2nd Round Interview","sample"]])];

var myApps = await cb.getProperty("applications", userID, "users");
if(myApps == ""){
    myApps = [];
}else{
    myApps = JSON.parse(myApps);
}
renderMyApps();
renderSorts();
renderStatTypes();

function renderSorts(){
    document.getElementById("appsSort").innerHTML = "";
    for(var sort in sorts){
        var option = document.createElement("option");
        option.value = sort;
        option.innerHTML = "Sort By " + sort;
        document.getElementById("appsSort").appendChild(option);
    }
}

function sortByDate(a, b){
    var aYear = parseInt(a.date.substring(a.date.length - 4));
    var bYear = parseInt(b.date.substring(b.date.length - 4));
    if(aYear != bYear){
        return aYear - bYear;
    }
    var aMonth = a.date.substring(0, a.date.length - 5);
    var bMonth = b.date.substring(0, b.date.length - 5);
    return months[aMonth.toLowerCase()] - months[bMonth.toLowerCase()];
}

function sortByResult(a, b){
    return decisions[a.decision.toLowerCase()] - decisions[b.decision.toLowerCase()];
}

function sortByName(a, b){
    return a.company.toLowerCase().localeCompare(b.company.toLowerCase());
}



function renderMyApps(){
    document.getElementById("apps").innerHTML = "";
    console.log(myApps);
    if(myApps.length == 0){
        document.getElementById("apps").innerHTML = "Add your first application...";
        return;
    }
    myApps.sort(currentSort);

    for(let i = 0; i < myApps.length; i++){
        var company = myApps[i].company;
        var decision = myApps[i].decision;
        if(filterSearch(company)){
            var app = document.createElement("button");
            app.classList.add("app");
            app.innerHTML = company;
            app.style.backgroundColor = appColors[decision];
            app.addEventListener("click", openAppDetails)
            document.getElementById("apps").appendChild(app);
        }
    }
}

function filterSearch(company){
    if(search == ""){
        return true;
    }
    return company.toLowerCase().includes(search.toLowerCase());
}

function updateSearch(event){
    search = event.target.value;
    renderMyApps();
}

function updateSort(event){
    currentSort = sorts[event.target.value];
    renderMyApps();
}





function renderStats(){
    document.getElementById("stats").innerHTML = "";
    var totalCount = 0;
    for(let i = 0; i < stats.length; i++){
        if(stats[i][1] == 0){
            stats.splice(i, 1);
            i -= 1;
        }else{
            totalCount += stats[i][1];
        }
    }
    for(let i = 0; i < stats.length; i++){
        var categoryName = stats[i][0];
        var categoryValue = stats[i][1];
        var category = document.createElement("div");
        category.classList.add("statCategory");
        var name = document.createElement("div");
        name.classList.add("statCategoryName");
        name.innerHTML = categoryName;
        category.appendChild(name);
        var line = document.createElement("div");
        line.classList.add("statCategoryLine");
        category.appendChild(line);
        var data = document.createElement("div");
        data.classList.add("statCategoryData");
        var bar = document.createElement("div");
        bar.classList.add("statCategoryBar");
        bar.style.backgroundColor = statColors[categoryName];
        bar.style.width = 100.0 * (categoryValue / totalCount) + "%";
        data.appendChild(bar);
        var value = document.createElement("div");
        value.classList.add("statCategoryValue");
        value.innerHTML = categoryValue;
        data.appendChild(value);
        category.appendChild(data);
        document.getElementById("stats").appendChild(category);
    }

    document.getElementById("stats").style.transform = "scale(1)"
}

function renderStatTypes(){
    document.getElementById("statTypes").innerHTML = "";
    for(let i = 0; i < statTypes.length; i++){
        var statType = document.createElement("button");
        statType.classList.add("statType");
        statType.innerHTML = statTypes[i][0];
        statType.addEventListener("click", statTypes[i][1]);
        statType.addEventListener("click", selectStatType);
        document.getElementById("statTypes").appendChild(statType);

        if(i == 0){
            statType.click();
        }
    }
}



function selectStatType(event){
    var statTypeButtons = document.getElementsByClassName("statType");
    for(let i = 0; i < statTypeButtons.length; i++){
        statTypeButtons[i].classList.remove("statTypeSelected");
    }
    event.target.classList.add("statTypeSelected");
    currentStatType = event.target.innerHTML;
    
    document.getElementById("statsHeader").innerHTML = event.target.innerHTML;
    
    document.getElementById("stats").style.transform = "scale(0)";

    setTimeout(() => {
        renderStats();
    }, 500);
}

function updateStats(){
    document.getElementById("stats").style.transform = "scale(0)";
    for(let i = 0; i < statTypes.length; i++){
        if(statTypes[i][0] == currentStatType){
            statTypes[i][1]();
            setTimeout(() => {
                renderStats();
            }, 500);
            return;
        }
    }
}

function resultsOverview(event){
    stats = [["Accepted", 0], ["Withdrew", 0], ["Rejected", 0]]
    for(let i = 0; i < myApps.length; i++){
        var decision = myApps[i].decision;
        for(let i = 0; i < stats.length; i++){
            if(stats[i][0] == decision){
                stats[i][1] += 1;
                break;
            }
        }
    }

}

function resultsByRound(event, results){
    stats = [["Application", 0], ["First Round", 0], ["Second Round", 0], ["Third Round", 0]];
    for(let i = 0; i < myApps.length; i++){
        var decision = myApps[i].decision;
        if(results.includes(decision)){
            var stages = myApps[i].stages;
            stats[stages.length - 1][1] += 1;
        }
    }
}


function renderAppDetails(company){
    var theApp = null;
    for(let i = 0; i < myApps.length; i++){
        if(myApps[i].company == company){
            theApp = myApps[i];
            currentApp = theApp;
            currentAppIndex = i;
        }
    }

    document.getElementById("appDetailsCompany").innerHTML = theApp.company;
    document.getElementById("appDetailsDate").innerHTML = theApp.date;
    document.getElementById("appDetailsStages").innerHTML = "";
    var stages = theApp.stages;
    for(let i = 0; i < stages.length; i++){
        var stage = document.createElement("div");
        stage.classList.add("appDetailsStage");
        var name = document.createElement("div");
        name.classList.add("appDetailsStageName");
        name.innerHTML = stages[i][0];
        stage.appendChild(name);
        var divider = document.createElement("div");
        divider.classList.add("appDetailsStageDivider");
        stage.appendChild(divider);
        var desc = document.createElement("div");
        desc.classList.add("appDetailsStageDesc");
        desc.innerHTML = stages[i][1];
        stage.appendChild(desc);
        document.getElementById("appDetailsStages").appendChild(stage);
    }
    document.getElementById("appDetailsDecision").innerHTML = "-> " + theApp.decision;
    document.getElementById("appDetailsDecision").style.backgroundColor = appColors[theApp.decision];
}

function editAppDetails(){
    closeAppDetails();
    document.getElementById("appDetailsPopup").querySelector(".filter").style.display = "none";
    setTimeout(() => {
        document.getElementById("appDetailsPopup").querySelector(".filter").style.display = "block";
    }, 300)
    openNewApp();
    editing = true;
    document.getElementById("newAppTitle").innerHTML = "Edit Application";
    document.getElementById("newAppDeleteButton").style.display = "block";
    document.getElementById("newAppCompany").value = currentApp.company;
    document.getElementById("newAppDate").value = currentApp.date;
    document.getElementById("newAppDecision").value = currentApp.decision;
    var realStages = currentApp.stages;
    for(let i = 0; i < realStages.length; i++){
        addNewStage(null, realStages[i][0], realStages[i][1]);
    }
}

function closeAppDetails(){
    document.getElementById("appDetailsSection").style.transform = "scale(0)";
    setTimeout(() => {
        document.getElementById("appDetailsPopup").style.display = "none";
    }, 300);
}

function openAppDetails(event){
    document.getElementById("appDetailsPopup").style.display = "flex";
    setTimeout(() => {
        document.getElementById("appDetailsSection").style.transform = "scale(1)";
    }, 50);
    renderAppDetails(event.target.innerHTML);
}

function openNewApp(){
    editing = false;
    document.getElementById("newAppTitle").innerHTML = "New Application";
    document.getElementById("newAppDeleteButton").style.display = "none";
    document.getElementById("newAppPopup").style.display = "flex";
    setTimeout(() => {
        document.getElementById("newAppSection").style.transform = "scale(1)";
    }, 50);
}

function closeNewApp(){
    document.getElementById("newAppCompany").value = "";
    document.getElementById("newAppDate").value = "";
    document.getElementById("newAppDecision").value = "";
    var stages = document.querySelectorAll(".newAppStage");
    stages.forEach(element => {
        element.remove();
    });

    document.getElementById("newAppSection").style.transform = "scale(0)";
    setTimeout(() => {
        document.getElementById("newAppPopup").style.display = "none";
    }, 300);
}



async function saveNewApp(){
    var company = document.getElementById("newAppCompany").value;
    var date = document.getElementById("newAppDate").value;
    var decision = document.getElementById("newAppDecision").value;
    var stages = document.querySelectorAll(".newAppStage");
    var realStages = [];
    stages.forEach(element => {
        var name = element.querySelector(".newAppStageInputSmallBox").value;
        var desc = element.querySelector(".newAppStageInputBigBox").value;
        realStages.push([name, desc]);
    });
    if(editing){
        myApps[currentAppIndex] = new App(company, date, decision, realStages);
    }else{
        var newApp = new App(company, date, decision, realStages);
        myApps.push(newApp);
    }
    renderMyApps();
    updateStats();
    closeNewApp();

    await cb.setProperty("applications", JSON.stringify(myApps), userID, "users");
}

function addNewStage(event, name = null, desc = null){
    var stage = document.createElement("div");
    stage.classList.add("newAppStage");
    var smallInput = document.createElement("div");
    smallInput.classList.add("newAppStageSmallInput");
    var smallInputLabel = document.createElement("div");
    smallInputLabel.classList.add("newAppStageInputLabel");
    smallInputLabel.innerHTML = "Stage Name";
    smallInput.appendChild(smallInputLabel);
    var smallInputBox = document.createElement("input");
    smallInputBox.classList.add("newAppStageInputSmallBox");
    if(name != null){
        smallInputBox.value = name;
    }
    smallInput.appendChild(smallInputBox);
    var stageDelete = document.createElement("button");
    stageDelete.classList.add("newAppStageDelete");
    stageDelete.onclick = deleteStage;
    stageDelete.innerHTML = "Delete Stage";
    smallInput.appendChild(stageDelete);
    var bigInput = document.createElement("div");
    bigInput.classList.add("newAppStageBigInput");
    var bigInputLabel = document.createElement("div");
    bigInputLabel.classList.add("newAppStageInputLabel");
    bigInputLabel.innerHTML = "Description";
    bigInput.appendChild(bigInputLabel);
    var bigInputBox = document.createElement("textarea");
    bigInputBox.classList.add("newAppStageInputBigBox");
    if(desc != null){
        bigInputBox.value = desc;
    }
    bigInput.appendChild(bigInputBox);
    stage.appendChild(smallInput);
    stage.appendChild(bigInput);
    document.getElementById("newAppStages").insertBefore(stage, document.getElementById("newAppNewStage"));
}

function deleteStage(event){
    var button = event.target;
    var input = button.parentElement;
    var stage = input.parentElement;
    stage.remove();
}

async function deleteNewApp(){
    myApps.splice(currentAppIndex, 1);
    renderMyApps();
    updateStats();
    closeNewApp();
    await cb.setProperty("applications", JSON.stringify(myApps), userID, "users");
}

document.getElementById("appsSearch").addEventListener("input", updateSearch);
document.getElementById("appsSort").addEventListener("change", updateSort);

document.getElementById("appDetailsEdit").addEventListener("click", editAppDetails);
document.getElementById("appDetailsClose").addEventListener("click", closeAppDetails);
document.getElementById("newAppButton").addEventListener("click", openNewApp);
document.getElementById("newAppNewStage").addEventListener("click", addNewStage);
document.getElementById("newAppSaveButton").addEventListener("click", saveNewApp);
document.getElementById("newAppDeleteButton").addEventListener("click", deleteNewApp);
document.getElementById("newAppCancelButton").addEventListener("click", closeNewApp);
