import React from "react";
import ReactDOM from "react-dom";

import ee from "./EventEmitter";

import { CirclePicker } from 'react-color';

class AnnotationForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      form_hidden: true,
      current_form_action: "Add Bubble",
      edit_bubble_data: { // set state.edit_bubble_data to the default data we want to use for new bubbles
        id: "",
        title: "",
        color: "#00ff00",
        shape: "circle",
        level: "1",
        start_time: "",
        stop_time: ""
      }
    }
  }

  componentDidMount () {
    ee.on("bubble:editBubble", (bubble) => {
      console.log("Displaying bubble in AnnotationForm");
      this.setState({ form_hidden: false, current_form_action: "Edit Bubble", edit_bubble_data: bubble });
    });
  }

  // Functions to handle changes when the user inputs info into the AnnotationForm
  onShapeChange = (e) => {
    console.log(e);
    var editing_bubble = this.state.edit_bubble_data;
    editing_bubble.shape = e.target.value;
    this.setState({ edit_bubble_data: editing_bubble });
    this.updatePreview();
  }

  onLevelChange = (e) =>  {
    var editing_bubble = this.state.edit_bubble_data;
    editing_bubble.level = e.target.value;
    this.setState({ edit_bubble_data: editing_bubble });
    this.updatePreview();
  }

  onTitleChange = (e) =>  {
    var editing_bubble = this.state.edit_bubble_data;
    editing_bubble.title = e.target.value;
    this.setState({ edit_bubble_data: editing_bubble });
    this.updatePreview();
  }

  onColorChange = (color) => {
    console.log(color);
    var editing_bubble = this.state.edit_bubble_data;
    editing_bubble.color = color.hex;
    this.setState({ edit_bubble_data: editing_bubble });
    this.updatePreview();
  }

  // Function that is triggered when the user clicks the "Set Start" button
  setStartTime = () => {
    var audio = ReactDOM.findDOMNode(audioPlayer);
    var startTime = parseFloat(audio.currentTime).toFixed(1);
    var editing_bubble = this.state.edit_bubble_data;
    editing_bubble.start_time = startTime;
    this.setState({ edit_bubble_data: editing_bubble });
    this.updatePreview();
  }

  // Function that is triggered when the user clicks the "Set Stop" button
  setStopTime = () => {
    var audio = ReactDOM.findDOMNode(audioPlayer);
    var stopTime = parseFloat(audio.currentTime).toFixed(1);
    var editing_bubble = this.state.edit_bubble_data;
    editing_bubble.stop_time = stopTime;
    this.setState({ edit_bubble_data: editing_bubble });
    this.updatePreview();
  }

  // Function that is triggered when the user manually changes the numeric value in the start time input box
  onStartTimeChange = (e) => {
    var editing_bubble = this.state.edit_bubble_data;
    editing_bubble.start_time = e.target.value;
    this.setState({ edit_bubble_data: editing_bubble });
    this.updatePreview();
  }

  // Function that is triggered when the user manually changes the numeric value in the stop time input box
  onStopTimeChange = (e) => {
    var editing_bubble = this.state.edit_bubble_data;
    editing_bubble.stop_time = e.target.value;
    this.setState({ edit_bubble_data: editing_bubble });
    this.updatePreview();
  }

  clearForm = () => {
    // Set state.edit_bubble_data back to the default data we want to use for new bubbles
    var editing_bubble = {
      id: "",
      title: "",
      color: "#00ff00",
      shape: "circle",
      level: "1",
      start_time: "",
      stop_time: ""
    }

    this.setState({ form_hidden: true, current_form_action: "Add Bubble", edit_bubble_data: editing_bubble });

    var preview_bubble = { // reset to an empty "ghost" preview bubble
      id: "",
      title: "",
      color: "",
      shape: "",
      level: "",
      start_time: "",
      stop_time: ""
    }

    ee.emit("bubble:updateBubblePreview", preview_bubble);
  }

  clickPanel = () => {
    // If we're adding a new bubble, then grab the currentTime from the audio player
    // and populate it into the AnnotationForm; also unhide the form
    if (this.state.current_form_action == "Add Bubble") {
      var audio = ReactDOM.findDOMNode(audioPlayer);
      var startTime = parseFloat(audio.currentTime).toFixed(1);

      var editing_bubble = this.state.edit_bubble_data;
      editing_bubble.start_time = startTime;
      this.setState({ form_hidden: false, edit_bubble_data: editing_bubble });
      this.updatePreview();
    }
    // Otherwise, do nothing special when the panel is clicked
  }

  updatePreview = () => {
    ee.emit("bubble:updateBubblePreview", this.state.edit_bubble_data);
  }

  handleSubmit = (e) => {
    console.log(e);
    e.preventDefault();

    // Catch errors in form fields before saving...
    if (this.state.edit_bubble_data.shape == "") {
      alert ("Make sure you set a shape before you save!");
    } else if (this.state.edit_bubble_data.color == undefined || this.state.edit_bubble_data.color == "") {
      alert ("Make sure you set a color before you save!");
    } else if (!(/^#[0-9A-F]{6}$/i.test(this.state.edit_bubble_data.color))) {
      alert ("Please select a valid hex color before you save!  Not sure what a hex color is?  Visit http://www.color-hex.com/ for examples of valid hex colors you can use.");
    } else if (this.state.edit_bubble_data.level == "") {
      alert ("Make sure you set a level before you save!");
    } else if (this.state.edit_bubble_data.start_time == "" || this.state.edit_bubble_data.start_time == undefined || this.state.edit_bubble_data.start_time < 0) {
      alert ("Make sure you set a valid start time before you save!");
    } else if (this.state.edit_bubble_data.stop_time == "" || this.state.edit_bubble_data.stop_time == undefined || this.state.edit_bubble_data.stop_time < 0) {
      alert ("Make sure you set a valid stop time before you save!");
    } else if (parseFloat(this.state.edit_bubble_data.start_time) > parseFloat(this.props.audioDuration)) {
      alert("Make sure your start time is set before the end of your audio file!");
    } else if (parseFloat(this.state.edit_bubble_data.stop_time) > parseFloat(this.props.audioDuration)) {
      alert("Make sure your stop time is set before the end of your audio file!");
    } else if (parseFloat(this.state.edit_bubble_data.stop_time) <= parseFloat(this.state.edit_bubble_data.start_time)) {
      alert("Make sure you set a stop time that is later than the start time!");
    } else if (this.state.edit_bubble_data.title.length > 100) {
      // Right now, the maxLength setting on the title input field is enforcing a 100 character limit.
      // Alternatively, we could manually shorten the title here and throw an alert instead.
      //this.props.alert({ type: "danger", text: "Your bubble's title was longer than 100 characters! We've trimmed it to fit into the visualization.", icon: "glyphicon glyphicon-warning-sign" });
    } else {
      // If there are no errors in the form inputs, we can proceed to saving the bubble...

      // If we're adding a new bubble, then create a new id and emit an event to save it as a new bubble
      if (this.state.current_form_action == "Add Bubble") {
        var newBubbleID = new Date().getTime();
        var editing_bubble = this.state.edit_bubble_data;
        editing_bubble.id = newBubbleID;
        ee.emit("bubble:createBubble", editing_bubble);
      } else if (this.state.current_form_action == "Edit Bubble") {
        // If we're currently editing a bubble, then emit an event to update the existing bubble
        ee.emit("bubble:updateBubble", this.state.edit_bubble_data);
      } else {
        alert("Sorry! Something went wrong. Clearing the form so you can try again.");
        this.clearForm();
      }

      // Once we've saved the bubble, clear the form
      this.clearForm();

      return false;
    }
  }

  // Audio playback/preview functions

  playFromStartTime = () => {
    var playstart = this.state.edit_bubble_data.start_time;
    var playstop = parseFloat(this.state.edit_bubble_data.start_time) + 3.0;
    this.playSnippet(playstart, playstop);
  }

  playToStopTime = () => {
    var playstart = parseFloat(this.state.edit_bubble_data.stop_time) - 3.0;
    var playstop = this.state.edit_bubble_data.stop_time;
    this.playSnippet(playstart, playstop);
  }

  playSnippet = (playstart, playstop) => {
    console.log("Playing from " + playstart + " to " + playstop);

    var audio = ReactDOM.findDOMNode(audioPlayer);

    audio.currentTime = playstart;

    var playStop = function(e){
      if (audio.currentTime >= playstop) {
          audio.pause();
          audio.removeEventListener('timeupdate', playStop, false);
      }
    }

    audio.addEventListener('timeupdate', playStop, false);
    audio.play();
  }


  render() {
    /* AnnotationForm panel overall styles */
    var panelClass = "panel";
    var headerIconClass = "glyphicon";

    // If the form is hidden, and we're not editing a bubble...
    if (this.state.form_hidden) {
      var cancelIcon = '';
      var cancelText = '';
      panelClass += " panel-info";
      headerIconClass += " glyphicon-hand-right";
    } else if (this.state.current_form_action == "Add Bubble") {
      var cancelIcon = 'glyphicon glyphicon-remove';
      var cancelText = 'Cancel';
      panelClass += " panel-info";
      headerIconClass += " glyphicon-hand-right";
    } else if (this.state.current_form_action == "Edit Bubble") {
      var cancelIcon = 'glyphicon glyphicon-remove'
      var cancelText = 'Cancel';
      panelClass += " panel-warning";
      headerIconClass += " glyphicon-pencil";
    }

    var colorPickerColors = ['#B80000', '#DB3E00', '#FCCB00', '#008B02', '#006B76', '#1273DE', '#004DCF', '#5300EB', '#000000'];


    return (
      <div className={panelClass}>

        <div className="panel-heading">
          <h2 className="panel-title">
            <a onClick={this.clickPanel} ><i className={headerIconClass}></i> {this.state.current_form_action}</a>
            <a onClick={this.clearForm} className="pull-right">{cancelText} <i className={cancelIcon}></i></a>
          </h2>
        </div>

        <div className={this.state.form_hidden ? "hidden" : ""}>

          <div className="panel-body">

            <form role="form" className="form-horizontal" >

              <div className="form-group">

                <label className="hidden" htmlFor="annotation_shape">Shape</label>
                <div className="col-xs-2">
                  <select id="annotation_shape" ref="annotation_shape" className="form-control" value={this.state.edit_bubble_data.shape} onChange={this.onShapeChange} >
                    <option value="" disabled>Select shape</option>
                    <option value="circle">Circle</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </div>

                <label className="hidden" htmlFor="annotation_level">Level</label>
                <div className="col-xs-2">
                  <select required id="annotation_level" ref="annotation_level" className="form-control" value={this.state.edit_bubble_data.level} onChange={this.onLevelChange} >
                    <option value="" disabled >Select level</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>

                <label className="hidden" htmlFor="annotation_title">Title</label>
                <div className="col-xs-8">
                  <input id="annotation_title" ref="annotation_title" type="text" maxLength="100" className="form-control" value={this.state.edit_bubble_data.title} placeholder="Title..." onChange={this.onTitleChange} />
                </div>

              </div>

              <div className="form-group">
                <label className="hidden" htmlFor="annotation_color">Color</label>
                <div className="col-sm-6 col-sm-offset-3 col-xs-12">
                  <CirclePicker colors={colorPickerColors} width="100%" id="annotation_color" color={this.state.edit_bubble_data.color} onChange={this.onColorChange} />
                </div>
              </div>

              <div className="form-group">

                <div className="col-sm-4">
                  <div className="input-group">
                    <span className="input-group-btn">
                      <a className="btn btn-success" onClick={this.setStartTime}>
                        Set Start
                      </a>
                    </span>

                    <label className="hidden" htmlFor="annotation_start_time">Start time</label>
                    <input id="annotation_start_time" ref="annotation_start_time" type="number" className="form-control" step="0.1" value={this.state.edit_bubble_data.start_time} onChange={this.onStartTimeChange} />

                    <span className="input-group-btn">
                      <a className="btn btn-default" >
                        <i className="glyphicon glyphicon-step-forward" onClick={this.playFromStartTime} ></i>
                      </a>
                    </span>
                  </div>
                </div>

                <div className="col-sm-4 col-sm-offset-2">
                  <div className="input-group">
                    <span className="input-group-btn">
                      <a className="btn btn-default" >
                        <i className="glyphicon glyphicon-step-forward" onClick={this.playToStopTime} ></i>
                      </a>
                    </span>

                    <label className="hidden" htmlFor="annotation_stop_time">Stop time</label>
                    <input id="annotation_stop_time" ref="annotation_stop_time" type="number" className="form-control" step="0.1" value={this.state.edit_bubble_data.stop_time} onChange={this.onStopTimeChange} />

                    <span className="input-group-btn">
                      <a className="btn btn-danger" onClick={this.setStopTime}>
                        Set Stop
                      </a>
                    </span>
                  </div>

                </div>

                <div className="col-sm-2">
                  <button className="btn btn-success btn-block" type="button" onClick={this.handleSubmit} >Save</button>
                </div>

              </div>

            </form>

          </div>
        </div>
      </div>
    )
  }

}

export default AnnotationForm;
