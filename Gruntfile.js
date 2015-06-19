var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var proxySnippet = require("grunt-connect-proxy/lib/utils").proxyRequest;
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
  };
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    clean: {
      html: {
        files: [{
          src: ["dist/*.html"]
        }]
      },
      dist: {
        files: [{
          dot: true,
          src: ["dist/*"]
        }

        ]
      }

    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      options: {
        livereload: 35738
      },
      md: {
        files: ["md/*.md"],
        tasks: ['copy:md', 'markdown', 'assemble']
      },
      asset: {
        files: ["custom/**", "images/**"],
        tasks: ["copy:asset"]
      },
      less: {
        files: ["custom/less/**"],
        tasks: ["less:server", "autoprefixer", "copy:asset"]
      },
      jst: {
        files: ["templates/template.jst"],
        tasks: ["markdown", "dom_munger"]
      },
      html: {
        files: ["templates/**"],
        tasks: ["clean:html", "markdown", "assemble"]
      },
      nunjucks: {
        files: ["views/**"],
        tasks: ['nunjucks']
      }
    },
    copy: {
      md: {
        files: [{
          expand: true,
          cwd: "md",
          src: "**",
          dest: "dist/md"
        }]
      },
      asset: {
        files: [{
          expand: true,
          src: "custom/**",
          dest: "dist/"
        }, {
          expand: true,
          src: "images/**",
          dest: "dist/"
        }, {
          expand: true,
          src: "fonts/**/*.*",
          dest: "dist/"
        }

        ]
      }
    },
    assemble: {
      options: {
        engine: 'swig',
        swig: {
          varControls: ["<%=", "%>"],
          cache: false
        },
        layoutdir: 'templates/layouts/',
        layout: ['template.swig'],
        flatten: true
      },
      md: {
        src: ['dist/*.html','!dist/md/*.html'],
        dest: 'dist/'
      },
      html: {
        src: ['templates/pages/*'],
        dest: 'dist/'
      }
    },
    markdown: {
      all: {
        files: [{
          expand: true,
          cwd: "dist/md",
          src: '*.md',
          dest: 'dist/',
          ext: '.html'
        },{
          expand: true,
          cwd: "dist/md/start",
          src: '*.md',
          dest: 'dist/start',
          ext: '.html'
        }],
        options: {
          template: 'templates/md.jst'
        }
      }
    },
    comment:{
      md: {
        src: 'dist/*.html'
      }
    },
    less: {
      server: {
        options: {
          dumpLineNumbers: "comments"
        },
        files: {
          "custom/css/app-docs.css": ["custom/less/app-docs.less"]
        }
      },
      dist: {
        files: {
          "custom/css/app-docs.css": ["custom/less/app-docs.less"]
        }
      }
    },
    autoprefixer: {
      server: {
        files: {
          "custom/css/app-docs.css": ["custom/css/app-docs.css"]
        }
      }
    },
    cssmin: {
      dist: {
        files: {
          "custom/css/app-docs.css": ["custom/css/app-docs.css"]
        }
      }
    },
    usemin: {
      html:['dist/*.html'],
      options: {
        dest: "dist/",
        root: "dist/"
      }
    },
    useminPrepare: {
      html:['dist/*.html'],
      options: {
        dest: "dist/",
        root: "dist"
      }
    },
    connect: {
      options: {
        port: 3000,
        hostname: "0.0.0.0",
        open: {
          target: "http://localhost:3000"
        }
      },
      proxies: [
        {
          context: "/1",
          host: "cn-stg1.leancloud.cn",
          port: 443,
          https: true,
          changeOrigin: true
        }
      ],
      livereload: {
        options: {
          middleware: function(connect) {
            return [
            proxySnippet,
            // require('connect-livereload')(), // <--- here
            mountFolder(connect, 'dist')];
          }
        }
      }
    },
    nunjucks: {
      precompile: {
        baseDir: 'views',
        src: 'views/*.md',
        destDir: 'md'
      }
    }
  });

  grunt.loadNpmTasks('grunt-dom-munger');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-contrib-livereload');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-connect-proxy');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('assemble');

  grunt.loadNpmTasks('grunt-usemin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-useminPrepare');
  grunt.loadNpmTasks('grunt-nunjucks');

  grunt.registerTask("build", ["clean", "nunjucks", "copy:md", "markdown","comment", "assemble",
   "less:dist", "autoprefixer", "cssmin", "copy:asset",
    "useminPrepare",'concat:generated',
    'uglify:generated',"usemin"]);
  grunt.registerTask("localBuild",["clean", "copy:md", "markdown", "assemble","comment",
   "less:dist", "autoprefixer", "copy:asset"]);
  grunt.registerTask("server", ["localBuild", "less:server","configureProxies", "connect:livereload", "watch"]);





    grunt.registerMultiTask('comment','add version info',function(){
      // console.log('comment task',this.files,this.filesSrc);
      var cheerio = require('cheerio');
      var crypto = require('crypto');
      var AV = require('avoscloud-sdk').AV;
      AV.initialize("749rqx18p5866h0ajv0etnq4kbadodokp9t0apusq98oedbb", "axxq0621v6pxkya9qm74lspo00ef2gq204m5egn7askjcbib");
      var Doc = AV.Object.extend('Doc');
      var commentDoms = ['p'];
      var done = this.async();

      var sequence = Promise.resolve();

      var  allPromise = [];

      function initDocVersion(filepath,resolve,reject){
          var file = filepath;
          var content = grunt.file.read(filepath);
          var docVersion = crypto.createHash('md5').update(content).digest('hex');
          // console.log(docVersion)
          var $ = cheerio.load(content);
          $('html').first().attr('version', docVersion);

          var query = new AV.Query(Doc);
          query.equalTo('version', docVersion);
          console.log(3)

          query.first().then(function(doc) {
            console.log('first then')
            if (!doc) {
              doc = new Doc();
              doc.set('file', file)
              doc.set('version', docVersion);
              var snippets = [];
              commentDoms.forEach(function(dom) {
                $('#content ' + dom).each(function() {
                  var version = crypto.createHash('md5').update($(this).text()).digest('hex');
                  snippets.push({version: version});
                });
              });
              doc.set('snippets', snippets);
              return doc.save();
            }
          }).then(function() {
            console.log('second then')
            // 在文档中添加 version 标记
            commentDoms.forEach(function(dom) {
              $('#content ' + dom).each(function() {
                console.log('infile dom')
                console.log($(this))
                var version = crypto.createHash('md5').update($(this).text()).digest('hex');
                $(this).attr('version', version);
              });
            });
          grunt.file.write(filepath, $.html());
          resolve();
          // done();
        });
      }

      this.filesSrc.forEach(function(filepath) {
        allPromise.push(new Promise(function(resolve,reject){
          initDocVersion(filepath,resolve,reject)
        }));
      });

      Promise.all(allPromise).then(function(){
        console.log('allcompleted');
        done();
      })
  });


}
