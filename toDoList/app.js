//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const e = require("express");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://aag9131:hBF4Wn1al9kRwX2Z@cluster0.kfta6pw.mongodb.net/toDo");

console.log("Here");

const itemSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})


const Item = mongoose.model("Item", itemSchema);
console.log("Item Model created");

const List = mongoose.model("List", listSchema);
console.log("List model created");

async function getItems(){
  const Items = await Item.find({}).lean();
  return Items;
}

async function removeItem(id){
  await Item.findByIdAndRemove(id);
}

async function findList(listName){
  console.log(listName)
  const foundList = await List.findOne({name:listName}).lean();
  return foundList;
}

async function addToList(listName, newItem){
  // var items=[];
  // await List.findOne({name: listName}).then(function(foundList){
  //   items=foundList.items;
  // })

  // items.push(newItem)
  const foundList = await List.findOneAndUpdate({name:listName}, {$push : {items: newItem}}).lean();
}

async function removeFromList(listName, item_id){
  // var items=[];
  // await List.findOne({name: listName}).then(function(foundList){
  //   items=foundList.items;
  // })
  
  // items.push(newItem)
  const foundList = await List.findOneAndUpdate({name:listName}, {$pull : {items:{_id : item_id}}}).lean();
}


const item1 = new Item({
  name: "Welcome to your toDo list"
});
console.log(item1.name);

const item2 = new Item({
  name: "Hit the + button to add a new item"
});
console.log(item2.name);

const item3 = new Item({
  name: "<-- Hit this button to delete the item"
});
console.log(item3.name);

const defaultItems = [item1,item2,item3];



app.get("/", function(req, res) {
  getItems().then(function(foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems)
      .then(function () {
        console.log("Successfully saved defult items to DB");
      })
      .catch(function (err) {
        console.log(err);
      });
      res.redirect("/")
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  })
  

});

app.get("/:customListName", function(req, res){

  const customListName = _.capitalize(req.params.customListName);
  
  findList(customListName).then(function(foundList){
    
    if(!foundList){
      console.log("New list")
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        List.insertMany(list).then(function(){
          console.log("Inserted default items into "+customListName+" toDoList")
          res.redirect("/"+customListName);
        });
      }

      else{
        console.log("Not new list");
        
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
  })
})



app.post("/", function(req, res){

  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: item
  });

  if(listName==="Today"){
    Item.insertMany(newItem).then(function(){
      res.redirect("/");
    });
    
  } else{
    addToList(listName, newItem).then(function(foundList){
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete", function(req, res){
  const item_id = req.body.newUserItem;
  const listName = req.body.listName;

  if(listName==="Today"){
    removeItem(item_id).then(
      console.log("removed item")
    )
    res.redirect("/");
  }
  else{
    removeFromList(listName, item_id).then(function(){
      res.redirect("/"+listName);
    })
  }


  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
