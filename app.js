// const express = require("express");
// const app = express();
// const userModel = require("./models/user");
// const postModel = require("./models/post");
// const cookieParser = require("cookie-parser");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const path =require('path')
// // const multer=require("multer");
// const multerconfig = require("./config/multerconfig");
// const upload = require("./config/multerconfig");


// app.set("view engine", "ejs");
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname,"public")));

// // Multer Storage
// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, "./public/images/uploads");
// //   },
// //   filename: function (req, file, cb) {
// //     crypto.randomBytes(12, (err, bytes) => {
// //       const fn =bytes.toString('hex') + path.extname(file.originalname);
// //       cb(null,fn);
        
// //     });
// //   },
// // });

// // const upload = multer({ storage: storage });
// //

// app.get("/", (req, res) => {
//   res.render("index");
// });

// app.get("/profile/upload", (req, res) => {
//   res.render("profileupload");
// });

// app.post("/upload",isLoggedIn, upload.single('image'), async(req, res) => {
//    let user = await userModel.findOne({email :req.user.email});
//    user.profilepic =req.file.filename;
//    await user.save()
//    res.redirect('/profile');
  
// });
// //Multer New concepted
// // app.get("/test", (req, res) => {
// //   res.render("test");
// // });
// // app.post("/upload",upload.single("image"), (req, res) => {
// //   console.log(req.file);
// // });
// // //

// app.get("/login", (req, res) => {
//   res.render("login");
// });
// app.get("/profile", isLoggedIn, async (req, res) => {
//   let user = await userModel
//     .findOne({ email: req.user.email })
//     .populate("posts");
//   res.render("profile", { user });
// });
// app.get("/like/:id", isLoggedIn, async (req, res) => {
//   let post = await postModel.findOne({ _id: req.params.id }).populate("user");
//   if (post.likes.indexOf(req.user.userid) === -1) {
//     post.likes.push(req.user.userid);
//   } else {
//     post.likes.splice(post.likes.indexOf(req.user.userid), 1);
//   }

//   await post.save();
//   res.redirect("/profile");
// });
// app.get("/edit/:id", isLoggedIn, async (req, res) => {
//   let post = await postModel.findOne({ _id: req.params.id }).populate("user");
//   res.render("edit", { post });
// });
// app.post("/update/:id", isLoggedIn, async (req, res) => {
//   let post = await postModel
//     .findOneAndUpdate({ _id: req.params.id }, { content: req.body.content })
//     .populate("user");
//   res.redirect("/profile");
// });
// app.post("/post", isLoggedIn, async (req, res) => {
//   let user = await userModel.findOne({ email: req.user.email });
//   let { content } = req.body;
//   let post = await postModel.create({
//     user: user._id,
//     content,
//   });
//   user.posts.push(post._id);
//   await user.save();
//   res.redirect("/profile");
// });

// app.post("/register", async (req, res) => {
//   let { email, password, username, name, age } = req.body;
//   let user = await userModel.findOne({ email });
//   if (user) {
//     return res.status(400).send("User already exists");
//   }

//   bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(password, salt, async (err, hash) => {
//       let user = await userModel.create({
//         username,
//         email,
//         password: hash,
//         name,
//         age,
//       });

//       let token = jwt.sign({ email: email, userid: user._id }, "piyushthedon");
//       res.cookie("token", token);
//       res.send("registered");
//       //   res.redirect('/register')
//     });
//   });
// });

// app.post("/login", async (req, res) => {
//   let { email, password } = req.body;
//   let user = await userModel.findOne({ email });
//   if (!user) {
//     return res.status(400).send("Something went Wrong");
//   }
//   bcrypt.compare(password, user.password, (err, result) => {
//     if (result) {
//       let token = jwt.sign({ email: email, userid: user._id }, "piyushthedon");
//       res.cookie("token", token);
//       res.status(200).redirect("/profile");
//     } else res.redirect("/login");
//   });
// });

// app.get("/logout", (req, res) => {
//   res.cookie("token", "");
//   res.redirect("/login");
// });

// function isLoggedIn(req, res, next) {
//   const token = req.cookies.token;

//   if (!token) {
//     // no token at all → redirect
//     return res.redirect("/login");
//   }

//   try {
//     const data = jwt.verify(token, "piyushthedon");
//     req.user = data;
//     next();
//   } catch (err) {
//     console.error("JWT error:", err.message);
//     // invalid/expired token → clear cookie & redirect
//     res.clearCookie("token");
//     return res.redirect("/login");
//   }
// }

// app.listen(3000, () => {
//   console.log(`Server is running on port 3000: http://localhost:3000/`);
// });

const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
const upload = require("./config/multerconfig");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ========== ROUTES ==========

// Home
app.get("/", (req, res) => {
  res.render("index");
});

// Upload profile pic page
app.get("/profile/upload", (req, res) => {
  res.render("profileupload");
});

// Upload profile pic (safe)
app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error during upload");
  }
});

// Login page
app.get("/login", (req, res) => {
  res.render("login");
 
});

// Profile page
app.get("/profile", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel
      .findOne({ email: req.user.email })
      .populate("posts");

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.render("profile", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error while loading profile");
  }
});

// Like a post
app.get("/like/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user");
    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (post.likes.indexOf(req.user.userid) === -1) {
      post.likes.push(req.user.userid);
    } else {
      post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }

    await post.save();
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while liking post");
  }
});

// Edit post page
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user");
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("edit", { post });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while loading edit page");
  }
});

// Update post
app.post("/update/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findOneAndUpdate(
      { _id: req.params.id },
      { content: req.body.content },
      { new: true }
    ).populate("user");

    if (!post) {
      return res.status(404).send("Post not found");
    }

    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while updating post");
  }
});

// Create post
app.post("/post", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).send("User not found");
    }

    let { content } = req.body;
    if (!content) {
      return res.status(400).send("Content cannot be empty");
    }

    let post = await postModel.create({
      user: user._id,
      content,
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while creating post");
  }
});

// Register
app.post("/register", async (req, res) => {
  try {
    let { email, password, username, name, age } = req.body;
    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).send("User already exists");
    }

    bcrypt.genSalt(10, (err, salt) => {
      if (err) return res.status(500).send("Error generating salt");

      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) return res.status(500).send("Error hashing password");

        let user = await userModel.create({
          username,
          email,
          password: hash,
          name,
          age,
        });

        let token = jwt.sign(
          { email: email, userid: user._id },
          "piyushthedon"
        );
        res.cookie("token", token);
        res.redirect("profile")
        // res.send("registered");
        
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error during registration");
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid email or password");
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error comparing password");
      }

      if (result) {
        let token = jwt.sign(
          { email: email, userid: user._id },
          "piyushthedon"
        );
        res.cookie("token", token);
        res.status(200).redirect("/profile");
      } else {
        res.status(400).send("Invalid email or password");
      }
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error during login");
  }
});

// Logout
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});

// ========== MIDDLEWARE ==========

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const data = jwt.verify(token, "piyushthedon");
    req.user = data;
    next();
  } catch (err) {
    console.error("JWT error:", err.message);
    res.clearCookie("token");
    return res.redirect("/login");
  }
}

// ========== START SERVER ==========
app.listen(3000, () => {
  console.log(`Server is running on port 3000: http://localhost:3000/`);
});
