var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function(connect, dir) {
    return connect.static(require('path').resolve(dir));
  };
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    clean: {
      html:{
        files:[{
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
        livereload: 1337,
      },
      md: {
        files: ["md/*.md"],
        tasks: ['copy:md', 'shell:doctoc', 'markdown', 'assemble:md', 'dom_munger']
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
        files: ["templates/**/*.*"],
        tasks: ["clean:html","markdown","assemble"]
      }
    },
    shell: { // Task
      doctoc: { // Target
        options: { // Options
          stdout: true
        },
        command: 'cd dist/md && doctoc . && cd ../../'
      }
    },
    copy: {
      md: {
        files: [{
          expand: true,
          cwd: "md",
          src: "*.md",
          dest: "dist/md"
        }]
      },
      asset: {
        files: [{
          expand: true,
          cwd: "custom/",
          src: "**",
          dest: "dist/"
        }, {
          expand: true,
          src: "images/**",
          dest: "dist/"
        }, {
          expand: true,
          cwd: "md",
          src: "images/**",
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
        src: 'dist/*.html',
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
          "custom/app.css": ["custom/less/app.less"]
        }
      },
      dist: {
        files: {
          "custom/app.css": ["custom/less/app.less"]
        }
      }
    },
    autoprefixer: {
      server: {
        files: {
          "custom/app.css": ["custom/app.css"]
        }
      }
    },
    cssmin: {
      dist: {
        files: {
          "custom/app.css": ["custom/app.css"]
        }
      }
    },
    dom_munger: {
      doctoc: {
        options: {
          callback: function($) {
            var toc = $(".doc-content ul").eq(0);
            toc.attr("id", "toc");
            toc.attr("class", "nav");
            var nodes = toc.nextAll();

            if (!$("#content").length) {

              toc.after("<div id='content'></div>");
            }

            var l = nodes.length;

            for (var i = 0; i < l; i++) {
              nodes.eq(i).remove();
              $("#content").append(nodes.eq(i))
            }
            var level = 1;
            //encode hash
            // for(var i=0;i<$("#toc a").length;i++){
            //   $("#toc a").eq(i).attr("href","#"+encodeURIComponent($("#toc a").eq(i).attr("href").substring(1)));
            // }

            function iterate(parent, level) {
              var li = parent.children('li'); //当前级别目录的li
              for (var i = 0; i < li.length; i++) { //当前目录的所有 a
                var a = li.eq(i).children('a').eq(0);

                var h = $("h" + level);

                var hindex = 0;
                var aindex = 0;
                var lastfindindex = -1;
                for (var j = 0; j < h.length; j++) {
                  if (/-\d$/.test(a.attr("href"))) { //has multi same text h
                    aindex = a.attr("href").match(/-\d$/)[0].substring(1);
                  }
                  if (h.eq(j).text().trim() == a.text().trim()) { //找到对应的内容相同的H
                    lastfindindex = j;

                    if (aindex > 0 && aindex == hindex) { // aindex大于零 代表 标题会有重复的，当标题重复时 需要保证 生成的标题的位置和h的位置相对应
                      h.eq(j).attr('id', a.attr("href").substring(1));
                      // h.eq(j).append('<a id"'+decodeURIComponent(a.attr("href").substring(1))+'" class="anchor" href=""><span class="octicon octicon-link"></span></a>')
                      break;
                    } else {
                      if (aindex > 0) { //标题重复，并且位置对应时才替换，不对应则查找下一个对应的
                        hindex++;
                      } else { //不存在多个标题重复的情况直接替换
                        h.eq(j).attr('id', a.attr("href").substring(1))
                        // h.eq(j).append('<a id="'+decodeURIComponent(a.attr("href").substring(1))+'" class="anchor" href=""><span class="octicon octicon-link"></span></a>')
                        break;
                      }
                    }
                  }
                  if (aindex > 0 && j == h.length - 1 && lastfindindex > -1) { //如果存在标题重复，但最后仍未找到对应的index，则查找其中一个直接替换
                    h.eq(lastfindindex).attr('id', a.attr("href").substring(1))
                    // h.eq(lastfindindex).append('<a id="'+decodeURIComponent(a.attr("href").substring(1))+'" class="anchor" href=""><span class="octicon octicon-link"></span></a>')
                  }
                }
                if (li.eq(i).children('ul').length) {
                  iterate(li.eq(i).children('ul').eq(0), level + 1)
                }
              }

            }
            iterate(toc, 1);
          }


        },
        files: [{
          expand: true,
          cwd: "dist",
          src: ["*.html", "!sdk_down.html"],
          dest: "dist/"
        }]
      },
      tocpos: {

        options: {
          callback: function($) {
            $($(".doc-content p:first-child")[0]).remove();
            var toc = $("#toc");
            toc.remove();
            $(".sidebar-wrapper").append(toc);

            var homePlaceholder = $("div").hasClass("home-full-width-content");
            if (homePlaceholder) {
              $(".col-sm-3.sidebar-gruntfile-trigger").remove();
              $(".col-sm-9.sidebar-gruntfile-trigger").toggleClass("col-sm-9 col-sm-12");
            }
          }

        },
        files: [{
          expand: true,
          cwd: "dist",
          src: ["*.html", "!sdk_down.html"],
          dest: "dist/"
        }]

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
      dev: {
        options: {
          middleware: function(connect) {
            return [
            require('connect-livereload')(), // <--- here
            mountFolder(connect, 'dist')];
          }
        }
      }
    }


  });

  grunt.loadNpmTasks('grunt-dom-munger');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-livereload');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('assemble');

  // Default task(s).
  grunt.registerTask("test", ["clean", "copy:md", "shell:doctoc", "markdown", "dom_munger"]);
  // grunt.registerTask("testdoctoc",[ "clean", "copy:md", "shell:doctoc"])
  grunt.registerTask("build", ["clean", "copy:md", "shell:doctoc", "markdown", "assemble", "dom_munger", "less:dist", "autoprefixer", "cssmin", "copy:asset"]);
  grunt.registerTask("build1", ["clean", "copy:md", "markdown", "assemble", "less:dist", "autoprefixer", "cssmin", "copy:asset"]);
  grunt.registerTask("server", ["build1", "less:server", "connect", "watch"])

};