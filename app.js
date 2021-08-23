//username: admin-ansh
//password: vNvB3ZMDuA4WZ8s

const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ansh:vNvB3ZMDuA4WZ8s@cluster0.nuxw2.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemSchema = new mongoose.Schema({
  name: String,
});
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Item 1"
});

const item2 = new Item({
  name: "Item 2"
});

const item3 = new Item({
  name: "Item 3"
});

const defaultItems = [item1, item2, item3];

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, (err, results) => {
    if (err) {
      console.error(err);
    } else if (results.length === 0) {
      Item.insertMany(defaultItems, err => {
        if (err) {
          console.error(err);
        } else {
          res.redirect("/");
        }
      })
    } else {
      res.render("list", {listTitle: "Today", newListItems: results})
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const itemToAdd = new Item({
    name: itemName
  });

  if (listName == "Today") {
    itemToAdd.save().then(() => {
      res.redirect("/");
    }).catch(err => {
      console.error(err);
    });
  } else {
    List.findOne({name: listName}, (err, results) => {
      if (err) {
        console.error(err);
      } else {
        results.items.push(itemToAdd);
        console.log(results)
        results.save().then(() => {
          res.redirect("/" + listName);
        }).catch(err => {
          console.error(err);
        })
      }
    }) 
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.error(err);
      } else {
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, results) => {
      if (err) {
        console.error(err);
      } else {
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:typeOfList", (req, res) => {
  const typeOfList = _.capitalize(req.params.typeOfList);

  List.findOne({name: typeOfList}, (err, results) => {
    if (err) {
      console.error(err);
    } else if (!results) {
      // This is where we create a new list
      const list = new List({
        name: typeOfList,
        items: defaultItems,
      });
      list.save().then(() => {
        res.redirect("/" + typeOfList);
      }).catch(err => {
        console.error(err);
      });
    } else {
      // This is where we show the existing list to the viewer
      res.render("list", {listTitle: results.name, newListItems: results.items})
    }
  })

});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
