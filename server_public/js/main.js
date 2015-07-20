'use strict';
/* global React, $, document */
var TmplSelect = React.createClass({displayName: "TmplSelect",
  handleChange: function(e) {
    e.preventDefault();
    var tmpl = React.findDOMNode(this.refs.tmplSelect).value;
    if (tmpl) {
      this.props.onTmplSelect(tmpl);
    }
  },
  render: function() {
    var options = this.props.data.map(function(tmpl) {
      return (
        React.createElement("option", null, tmpl)
      );
    });
    return (
      React.createElement("select", {ref: "tmplSelect", onChange: this.handleChange}, 
        React.createElement("option", {value: ""}, "选择模板"), 
        options
      )
    );
  }
});

var ImplContent = React.createClass({displayName: "ImplContent",
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.onSaveContent(this.state.content);
  },
  handleChange: function(e) {
    this.setState({content: e.target.value});
  },
  componentWillReceiveProps: function(nextProps) {
    if (nextProps.data !== null) {
      this.setState({
        content: nextProps.data
      });
    }
  },
  render: function() {
    if (this.state) {
      return (
        React.createElement("div", null, 
          React.createElement("form", {onSubmit: this.handleSubmit}, 
            React.createElement("textarea", {rows: "8", cols: "160", value: this.state.content, onChange: this.handleChange}), 
            React.createElement("input", {type: "submit", value: "保存"})
          )
        )
      );
    } else {
      return (
        React.createElement("div", null)
      );
    }
  }
});

var TmplImpl = React.createClass({displayName: "TmplImpl",
  handleClick: function(e) {
    e.preventDefault();
    var impl = e.target.value;
    $.ajax({
      url: 'tmpls/' + this.props.data.currentTmpl + '/impls/' + impl + '/blocks/' + this.props.data.block,
      dataType: 'json',
      success: function(data) {
        this.setState({
          tmpl: this.props.data.currentTmpl,
          impl: impl,
          block: this.props.data.block,
          content: data.blockContent
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.url, status, err.toString());
      }.bind(this)
    });
  },
  handleSaveContent: function(content) {
    this.setState({content: content});
    $.ajax({
      url: 'tmpls/' + this.state.tmpl + '/impls/' + this.state.impl + '/blocks/' + this.state.block,
      method: 'POST',
      dataType: 'json',
      data: {content: content},
      success: function() {
        this.setState({
          content: content
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {
      content: null
    };
  },
  render: function() {
    var buttons = this.props.data.impls.map(function(impl) {
      return (
        React.createElement("input", {type: "button", value: impl, onClick: this.handleClick})
      );
    }.bind(this));
    return (
      React.createElement("div", null, 
        buttons, 
        React.createElement(ImplContent, {data: this.state.content, onSaveContent: this.handleSaveContent})
      )
    );
  }
});

var Paragraph = React.createClass({displayName: "Paragraph",
  handleClick: function(e) {
    e.preventDefault();
    this.setState({
      edit: true,
      content: this.props.data.paragraph
    });
  },
  handleSubmit: function(e) {
    e.preventDefault();
    this.props.onParagraphSubmit(this.state.content, this.props.data.index);
  },
  getInitialState: function() {
    return {
      edit: false
    };
  },
  handleChange: function(e) {
    this.setState({content: e.target.value});
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({
      content: nextProps.data,
      edit: false
    });
  },
  render: function() {
    if (this.state.edit) {
      return (
        React.createElement("div", null, 
          React.createElement("form", {onSubmit: this.handleSubmit}, 
            React.createElement("input", {type: "hidden", name: "index", value: this.props.data.index}), 
            React.createElement("textarea", {rows: "8", cols: "160", value: this.state.content, onChange: this.handleChange}), 
            React.createElement("input", {type: "submit", value: "保存"})
          )
        )
      );
    }
    // 这里用一个取巧的办法来切分 block，
    // 直接使用 {% endblock %} 来分割，比如下面内容:
    // content = 'abc{% block foo %}inner{% endblock %}def 123{% block bar %}inner2{% endblock %}456';
    // 通过 endblock 分割后变成:
    // blocks = [
    // [ 'abc{% block foo %}inner',
    //   'def 123{% block bar %}inner2',
    //   '456' ]
    // ]
    // 数据中每个元素再使用 /{% block (.*?) %}/ 分割，会得到：
    // ['abc', 'foo', 'inner']
    // 第一个为 block 前面的内容
    // 第二个为 block 名称
    // 第三个为 block 内部的预定义内容
    var content = this.props.data.paragraph;
    var blocks = content.split('{% endblock %}');
    if(blocks.length == 1) { // 不包含变量 block
      return (
        React.createElement("div", {onClick: this.handleClick}, content)
      );
    }
    var re = /{% block (.*?) %}/;
    var bs = blocks.map(function(block) {
      var tmp = block.split(re);
      if(tmp.length == 1) {
        return (
          React.createElement("div", null, tmp)
        );
      }
      var outer = tmp[0];
      var blockName = tmp[1];
      var inner = tmp[2];
      var data = {
        currentTmpl: this.props.data.currentTmpl,
        impls: this.props.data.impls,
        block: blockName
      };
      return (
        React.createElement("div", null, 
          React.createElement("span", null, outer), 
          React.createElement("code", null, blockName), 
          React.createElement(TmplImpl, {data: data}), 
          React.createElement("span", null, inner)
        )
      );
    }.bind(this));
    return (
      React.createElement("div", null, bs)
    );
  }
});

var TmplContent = React.createClass({displayName: "TmplContent",
  render: function() {
    var ps = this.props.data.tmplContent.paragraphs.map(function(paragraph, index) {
      var data = {
        paragraph: paragraph,
        index: index,
        currentTmpl: this.props.data.currentTmpl,
        impls: this.props.data.tmplImpls};
      return (
        React.createElement(Paragraph, {data: data, onParagraphSubmit: this.props.onParagraphSubmit})
      );
    }.bind(this));
    return (
      React.createElement("div", null, 
        ps
      )
    );
  }
});

var TmplBox = React.createClass({displayName: "TmplBox",
  handleTmplSelect: function(tmpl) {
    $.ajax({
      url: 'tmpls/' + tmpl + '/impls',
      dataType: 'json',
      success: function(data) {
        this.setState({currentTmpl: tmpl, tmplImpls: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.url, status, err.toString());
      }.bind(this)
    });
    
    $.ajax({
      url: 'tmpls/' + tmpl,
      dataType: 'json',
      success: function(data) {
        this.setState({tmplContent: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.url, status, err.toString());
      }.bind(this)
    });
  },
  handleParagraphSubmit: function(content, index) {
    console.log(content, index);
    $.ajax({
      url: 'tmpls/' + this.state.currentTmpl + '/paragraphs/' + index,
      method: 'POST',
      dataType: 'json',
      data: {content: content},
      success: function() {
        this.handleTmplSelect(this.state.currentTmpl);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.url, status, err.toString());
      }
    });
  },
  getInitialState: function() {
    return {
      tmpls: [],
      currentTmpl: '',
      tmplContent: {
        paragraphs: []
      }
    };
  },
  componentDidMount: function() {
    $.ajax({
      url: 'tmpls',
      dataType: 'json',
      success: function(data) {
        this.setState({tmpls: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    return (
      React.createElement("div", {className: "tmplBox"}, 
        React.createElement(TmplSelect, {data: this.state.tmpls, onTmplSelect: this.handleTmplSelect}), 
        React.createElement(TmplContent, {data: this.state, onParagraphSubmit: this.handleParagraphSubmit})
      )
    );
  }
});

React.render(
  React.createElement(TmplBox, null),
  document.getElementById('content')
);

