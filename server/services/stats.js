const models = require('./../models');
const { reject } = require('lodash');

class StatsService{
    static async fetchCollegeStats(collegeId){    
        var promises = [];

        //past events
        promises.push(models.Event.countDocuments( {organiserId: collegeId, date: { $lte : new Date()}} )  );

        // upcoming events
        promises.push(models.Event.countDocuments( {organiserId: collegeId, date: { $gte : new Date()}} )   );

        // jobs posted
        promises.push(models.Job
                        .find({collegeId})
                        .sort({createdAt: 1})
                        .select("createdAt -_id")
                    );

        // interviews posted
        promises.push(models.Interview
                                .find({collegeId})
                                .sort({createdAt: 1})
                                .select("createdAt -_id")
                            );

        // alumni registered
        promises.push(models.Alumni
                                .find({collegeId})
                                .sort({createdAt: 1})
                                .select("createdAt -_id")
                            );


        return new Promise((resolve, reject) => {
            Promise.all(promises)
                .then( ( [pastEvents, upcomingEvents, jobs, interviews, alumni] ) => {

                    var stats = {
                        pastEvents, upcomingEvents, jobs, interviews, alumni
                    }
                    resolve(stats);
                })
                .catch((err) => {
                    reject(err);
                });
        });

    }

    static async fetchAdminStats(collegeId){    
        var promises = [];

        //past events
        promises.push(models.Event.countDocuments( {date: { $lte : new Date()}} )  );

        // upcoming events
        promises.push(models.Event.countDocuments( {date: { $gte : new Date()}} )   );

        // jobs posted
        promises.push(models.Job
                        .find()
                        .sort({createdAt: 1})
                        .select("createdAt -_id")
                    );

        // interviews posted
        promises.push(models.Interview
                                .find()
                                .sort({createdAt: 1})
                                .select("createdAt -_id")
                            );

        // alumni registered
        promises.push(models.Alumni
                                .find()
                                .sort({createdAt: 1})
                                .select("createdAt -_id")
                            );


        return new Promise((resolve, reject) => {
            Promise.all(promises)
                .then( ( [pastEvents, upcomingEvents, jobs, interviews, alumni] ) => {

                    var stats = {
                        pastEvents, upcomingEvents, jobs, interviews, alumni
                    }
                    resolve(stats);
                })
                .catch((err) => {
                    reject(err);
                });
        });

    }

}

module.exports = StatsService;