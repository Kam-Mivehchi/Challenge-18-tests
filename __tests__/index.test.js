const chai = require('chai');
const { expect } = chai;
const { User, Thought } = require('../models');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
chai.use(chaiHttp);
const request = chai.request("http://localhost:3001");

const user1Data = {
   "username": "jenny",
   "email": "jenny@gmail.com"
};
const user2Data = {
   "username": "mike",
   "email": "mike@gmail.com"
};
const user3Data = {
   "username": "veronica",
   "email": "vero@gmail.com"
};
let user1;
let user2;
let user3;

let thought1;
let thought2;
let thought3;


describe("Module 18 Tests", () => {
   before(async () => {
      // Connect to the test database or create a separate test database
      try {
         mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/socialmedia', {
            useNewUrlParser: true,
            useUnifiedTopology: true
         });
         await User.deleteMany()
         await Thought.deleteMany()
      } catch (error) {
         console.log("Cannot Reset Database")
      }

   });
   after(async () => {
      // Connect to the test database or create a separate test database
      try {

         await User.deleteMany()
         await Thought.deleteMany()
         await mongoose.disconnect();

      } catch (error) {
         console.log("Cannot Reset Database")
      }

   });

   describe("User routes (Create, Read, Update)", () => {
      it("Creates 3 New Users", async () => {
         try {

            const res1 = await request.post("/api/users").send(user1Data)
            const res2 = await request.post("/api/users").send(user2Data)
            const res3 = await request.post("/api/users").send(user3Data)

            user1 = res1.body
            user2 = res2.body
            user3 = res3.body

            expect(res1.statusCode).to.equal(200)
            expect(res2.statusCode).to.equal(200)
            expect(res3.statusCode).to.equal(200)
         } catch (error) {
            console.error(error)
         }
      })
      it("Gets all Users", async () => {
         try {

            const response = await request.get("/api/users")


            expect(response.statusCode).to.equal(200)
            expect(response.body).to.have.lengthOf(3)
            response.body.forEach((user) => {
               // Ensure that each user has the required keys
               expect(user).to.include.all.keys("_id", "username", "email", "thoughts", "friends", "friendCount");
            });
            user1 = response.body[0]
            user2 = response.body[1]
            user3 = response.body[2]
         } catch (error) {
            console.error(error)

         }
      })
      it("Gets a single user", async () => {
         try {

            const response = await request.get(`/api/users/${user1._id}`)


            expect(response.statusCode).to.equal(200)
            expect(response.body).to.include.all.keys("_id", "username", "email", "thoughts", "friends", "friendCount");
            expect(response.body.username).to.equal(user1.username)

         } catch (error) {
            console.error(error)

         }
      })
      it("Updates a single user", async () => {
         try {
            const response = await request.put(`/api/users/${user1._id}`).send({
               "username": "shelly",
               "email": "shelly@gmail.com"
            })
            expect(response.statusCode).to.equal(200)

            const checkUser = await request.get(`/api/users/${user1._id}`)
            expect(checkUser.body).to.include.all.keys("_id", "username", "thoughts", "email", "friends", "friendCount");
            expect(checkUser.body.username).to.equal("shelly")
            expect(checkUser.body.email).to.equal("shelly@gmail.com")

            user1 = checkUser.body

         } catch (error) {
            console.error(error)

         }
      })
      it("Adds a friend to a user", async () => {
         const response = await request.post(`/api/users/${user1._id}/friends/${user2._id}`)
         expect(response.statusCode).to.equal(200)
         const checkUser = await request.get(`/api/users/${user1._id}`)

         expect(checkUser.body.friends).to.have.lengthOf(1)


         user1 = checkUser.body
      })
      it("Get single User populates Friends", async () => {
         const response = await request.get(`/api/users/${user1._id}`)
         expect(response.statusCode).to.equal(200)
         const checkUser = await request.get(`/api/users/${user1._id}`)

         response.body.friends.forEach((user) => {
            // Ensure that each user has the required keys
            expect(user).to.include.all.keys("_id", "username", "thoughts", "email", "friends", "friendCount");
         });


         user1 = checkUser.body
      })
   })

   describe("Thought routes (Create, Read, Update)", () => {
      it("Creates 3 New Thoughts", async () => {
         try {
            const res1 = await request.post("/api/thoughts/").send({
               thoughtText: "I need some breakfast",
               username: `${user1.username}`,
               userId: `${user1._id}`
            })
            const res2 = await request.post("/api/thoughts/").send({
               thoughtText: "I need some lunch",
               username: `${user2.username}`,
               userId: `${user2._id}`
            })
            const res3 = await request.post("/api/thoughts/").send({
               thoughtText: "I need some dinner",
               username: `${user3.username}`,
               userId: `${user3._id}`
            })



            expect(res1.statusCode).to.equal(200)
            expect(res2.statusCode).to.equal(200)
            expect(res3.statusCode).to.equal(200)
         } catch (error) {
            console.error(error)
         }
      })
      it("Gets all thoughts", async () => {
         try {

            const response = await request.get("/api/thoughts")

            expect(response.statusCode).to.equal(200)
            expect(response.body).to.have.lengthOf(3)
            response.body.forEach((thought) => {
               // Ensure that each thought has the required keys
               expect(thought).to.include.all.keys("_id", "thoughtText", "username", "createdAt", "reactions", "reactionCount");
            });
            thought1 = response.body[0]
            thought2 = response.body[1]
            thought3 = response.body[2]
         } catch (error) {
            console.error(error)

         }
      })
      it("Gets a single thought", async () => {
         try {

            const response = await request.get(`/api/thoughts/${thought1._id}`)


            expect(response.statusCode).to.equal(200)
            expect(response.body).to.include.all.keys("_id", "thoughtText", "username", "createdAt", "reactions", "reactionCount");
            expect(response.body.thoughtText).to.equal(thought1.thoughtText)

         } catch (error) {
            console.error(error)

         }
      })
      it("Updates a single thought", async () => {
         try {
            const response = await request.put(`/api/thoughts/${thought1._id}`).send({
               "thoughtText": "Let's try this again"
            })
            expect(response.statusCode).to.equal(200)

            const checkThought = await request.get(`/api/thoughts/${thought1._id}`)
            expect(checkThought.body).to.include.all.keys("_id", "thoughtText", "username", "createdAt", "reactions", "reactionCount");
            expect(checkThought.body.thoughtText).to.equal("Let's try this again")


            thought1 = checkThought.body

         } catch (error) {
            console.error(error)

         }
      })
   })
})