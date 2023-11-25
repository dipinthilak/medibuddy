const Category = require("../models/categorySchema");
const fs = require("fs");

const loadcategoryManagement = async (req, res) => {
  const categoryout = await Category.find();
  res.render("adminCategorymanagement", { category: categoryout });
};

const addCategory = async (req, res) => {
  res.render("adminCategoryadd");
};

const addnewCategory = async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      filename: "cpd" + req.file.filename,
      isListed: req.body.isListed,
    });
    categoryresult = await category.save();
    if (categoryresult) {
      res.redirect("/admin/categorymanagement");
    } else {
      res.redirect("/admin/categorymanagement", {
        err: "category not added",
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const sdeleteCategoryitem = async (req, res) => {
  try {
    const categoryId = req.query.id;
    // Find the category by ID and select its filename
    const category = await Category.findById(categoryId).select("filename");

    if (!category) {
      res.redirect("/admin/categorymanagement");
    }

    const catFileName = category.filename;

    // Delete the category
    // const cstatus= await Category.findById(categoryId);
    // if(cstatus == true)
    // {
    //   const catRem = await Category.updateOne(
    //     { _id: categoryId },
    //     { $set: { isListed: false } }
    //   );
    // }
    // else if(cstatus == false)
    // {
    //   const catRem = await Category.updateOne(
    //     { _id: categoryId },
    //     { $set: { isListed: true } }
    //   );
    // }
    const catRem = await Category.deleteOne({ _id: categoryId });
    if (catRem.deletedCount > 0) {
      // Image deletion
      fs.unlink(
        `C:/Users/dipin/Documents/VS Code/week11_14/medibuddy/public/admin/category/${catFileName}`,
        (err) => {
          if (err) {
            console.error("Error deleting image file:", err);
          } else {
            console.log(">>>>>>>>>>>>>>>Image file deleted successfully");
          }
        }
      );
    } else {
      console.log("Category not found.");
    }
    res.redirect("/admin/categorymanagement");
  } catch (error) {
    console.error("Error updateing category:", error);
    res.redirect("/admin/categorymanagement");
  }
};

const updateCategoryload = async (req, res) => {
  const catId = req.query.id;
  const catdata = await Category.findOne({ _id: catId });
  res.render("adminCategoryupdate", { catdata });
};

const updateCategoryitem = async (req, res) => {
  try {
    const catId = req.query.id;
    const catImg = req.query.img;
    categoryresult = await Category.findOneAndUpdate(
      { _id: catId },
      {
        name: req.body.name,
        description: req.body.description,
        filename: "cpd" + req.file.filename,
        isListed: "true",
      }
    );
    // Image deletion
    fs.unlink(
      `C:/Users/dipin/Documents/VS Code/week11_14/medibuddy/public/admin/category/${catImg}`,
      (err) => {
        if (err) {
          console.error("Error deleting image file:", err);
        } else {
          console.log(">>>>>>>>>>>>>>>Image file deleted successfully");
        }
      }
    );
    if (categoryresult) {
      res.redirect("/admin/categorymanagement");
    } else {
      res.redirect("/admin/categorymanagement", {
        err: "category not added",
      });
    }
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  loadcategoryManagement,
  addCategory,
  addnewCategory,
  sdeleteCategoryitem,
  updateCategoryload,
  updateCategoryitem,
};
