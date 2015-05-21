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

  grunt.registerTask("build", ["clean", "copy:md", "markdown", "assemble",
   "less:dist", "autoprefixer", "cssmin", "copy:asset",
    "useminPrepare",'concat:generated',
    'uglify:generated',"usemin"]);
  grunt.registerTask("localBuild",["clean", "copy:md", "markdown", "assemble",
   "less:dist", "autoprefixer", "copy:asset"]);
  grunt.registerTask("server", ["localBuild", "less:server","configureProxies", "connect:livereload", "watch"]);

};
