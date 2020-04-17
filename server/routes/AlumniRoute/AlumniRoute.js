const express = require('express');
const router = express.Router();

const _ = require('lodash');


const {Alumni} = require('./../../models/alumniModel.js');
const {Event} = require('./../../models/eventModel.js');
const {Job} = require('./../../models/jobModel.js');
const {Interview} = require('./../../models/interviewModel.js')

const {alumniAuth} = require('../../middleware/alumniAuth.js');


/*
 @Type: POST
 @Route: /register
 @Desc: Sign-up
*/
router.post('/register', (req, res) => {

    var alumni = new Alumni(req.body);

    alumni.education.push({
        "startYear": alumni.startYear.toString(),
        "endYear": alumni.endYear.toString(),
        "course": alumni.degree,
        "school": alumni.collegeName
    });

    alumni.save()
        .then(() => {
            return alumni.generateAuthToken();
        }).then((token) => {
            res.header('x-auth', token).send(alumni);
        }).catch((err) => {
            res.status(400).send(err);
        });

});


//login
router.post('/login', (req, res) => {
    
    var {email, password} = _.pick(req.body, ['email', 'password']);

    Alumni.findOne({email, password}) 
        .then((alumni) => {
            if(!alumni) {
                res.status(404).send({err: 'Check email/password.'});
            }
            return alumni.generateAuthToken()    
                .then((token) => {
                    res.status(200).header('x-auth', token).send({user:alumni});
                })
        })
        .catch((err) => {
            res.status(400).send(err)
        });
});


// me
router.get('/profile', alumniAuth ,(req, res) => {
    res.send(req.alumni);
})


router.patch('/profile', alumniAuth, (req, res) => {
    console.log(req.alumni);

    var alumni = req.alumni;

    Alumni.findByIdAndUpdate({_id: alumni._id}, {$set: req.body}, function(err, result){
        if(err){
            res.status(400).send(err);
        }
        res.send(result)
    })


})

//logout
router.delete('/logout', alumniAuth, (req, res) => {
    req.alumni.removeToken(req.token)
        .then(() => {
            res.status(200).send({msg: 'Logout Success'});
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


// Fill profile
router.post('/fill-profile', alumniAuth, (req, res) => {
    var {education, work, mobileNumber, location} = _.pick(req.body, ['education', 'work', 'mobileNumber', 'location']);

    var alumni = req.alumni;
    
    alumni.education = education;
    alumni.work = work;
    alumni.mobileNumber = mobileNumber;
    alumni.location = location;

    alumni.save()
        .then(() => {
            res.send("success");
        })
        .catch((err) => {
            res.status(400).send(err)
        })
});


// Get list of events
router.get('/events', alumniAuth, (req, res) => {
    
    // returns only the events organised by alumni's college
    Event.find({
        organiserId : req.alumni.collegeId,
        date: { $gte : new Date()}
    })
        .then((events) => {
            res.send(events)
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


// For getting full profile of a particular event
router.get('/events/:id', alumniAuth, (req, res) => {
    var eventId = req.params.id;
    
    Event.findOne({
        _id: eventId,
        organiserId: req.alumni.collegeId
        })
        .then((event) => {
            event.populate('attendees', ['firstName'])
                .execPopulate(function (err, event){
                    if(err){
                        res.status(400).send(err);
                    }
                    res.send({event})
                });
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.post('/events/attend/:id', alumniAuth, (req, res) =>{
    var eventId = req.params.id;

    Event.findOne({
        _id: eventId,
        organiserId: req.alumni.collegeId
    })
        .then((event) => {

            // if event doesn't exist
            if(!event) {
                res.status(404).json({err : "Event doesn't exist."})
            }

            // adds user to the list of event attendees
            event.attendees.push(req.alumni)
            event.save()
                .then(() => {
                    res.send({success : "event registration success"});
                })
                .catch((err) => {
                    res.status(400).send(err)
                });
        })
        .catch((err) => {
            res.status(400).send(err)
        });
});


// post job
router.post('/jobs', alumniAuth, (req, res) => {

    req.body.postedBy = req.alumni._id;
    req.body.collegeId = req.alumni.collegeId;
    var job = new Job(req.body);

    var keywords = [];
    keywords = keywords.concat(job.skillsRequired, job.qualification, job.company, job.industry, job.workTitle, job.typeOfJob);
    job.keywords = keywords;

    job.save()
        .then(() => {
            res.send({success: "job posted successfully", job})
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.get('/jobs', alumniAuth, (req, res) => {

    Job
        .find({
            collegeId: req.alumni.collegeId
        })
        .then((jobs) => {
            res.send(jobs);
        })
        .catch((err) => {
            res.status(400).send(err)
        }); 
});


router.post('/interviews', alumniAuth, (req, res) => {
    req.body.postedBy = req.alumni._id;
    req.body.collegeId = req.alumni.collegeId;

    var interview = new Interview(req.body);

    interview.save()
        .then(() => {
            res.send({success : "Interview experience posted successfully."})
        })
        .catch((err) => {
            res.status(400).send(err);
        });
});


router.get('/interviews', (req, res) => {

    var parameters = req.query;
    parameters.collegeId = req.alumni.collegeId;

    Interview
        .find(parameters)
        .then((interviews) => {
            res.send(interviews);
        })
        .catch((err) => {
            res.send(err);
        })
});



module.exports = router;