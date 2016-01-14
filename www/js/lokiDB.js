// Loki DB storage lib from Ionic framework
    // .factory('DBService', function($q, Loki, snService) {
    //     var _db;

//     function initDB() {
//         var adapter = new LokiCordovaFSAdapter({
//             "prefix": "loki"
//         });
//         _db = new Loki('snDB', {
//             autosave: true,
//             autosaveInterval: 1000, // 1 second
//             adapter: adapter
//         });
//     };

//     function getProjectsFromDB() {
//         return $q(function(resolve, reject) {
//             var options = {
//                 projects: {
//                     proto: Object,
//                     inflate: function(src, dst) {
//                         var prop;
//                         for (prop in src) {
//                             if (prop === 'Date') {
//                                 dst.Date = new Date(src.Date);
//                             } else {
//                                 dst[prop] = src[prop];
//                             }
//                         }
//                     }
//                 }
//             };
//             _db.loadDatabase(options, function() {
//                 _projects = _db.getCollection('projects');
//                 if (!_projects) {
//                     _projects = _db.addCollection('projects');
//                     snService.getProjects()
//                         .then(function(result) {
//                             console.log('in db projects call');
//                             _projects.insert(result);
//                         }, function(error) {
//                             console.log(error)
//                         });
//                 }
//                 resolve(_projects.data);
//             });
//         });
//     };
//     return {
//         initDB: initDB,
//         getProjectsFromDB: getProjectsFromDB
//     }

// });
