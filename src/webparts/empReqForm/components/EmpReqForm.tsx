import * as React from "react";
// import React, { useState } from 'react';
import styles from "./EmpReqForm.module.scss";
import { IEmpReqFormProps } from "./IEmpReqFormProps";
import { escape } from "@microsoft/sp-lodash-subset";

// import the reference to jquery.js and bootstrap.js
import * as $ from "jquery";
import { SPComponentLoader } from "@microsoft/sp-loader";

import { TextField } from "@fluentui/react/lib/TextField";
import { Image, IImageProps, ImageFit } from "@fluentui/react/lib/Image";
import {
  Dropdown,
  DropdownMenuItemType,
  IDropdownOption,
  IDropdownStyles,
  DatePicker,
  DayOfWeek,
  defaultDatePickerStrings,
  PrimaryButton,
  DefaultButton,
} from "@fluentui/react";

import CommOff from "./CompOff";

// specify css which comes with bootstrap and fontawesome
// faced problems using require and giving absolute path of css files
// system could not find the files
SPComponentLoader.loadCss(
  "https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css"
);
SPComponentLoader.loadCss(
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
);

// this will load the bootstrap.js file
require("bootstrap");

const imageProps: Partial<IImageProps> = {
  imageFit: ImageFit.centerContain,
  width: 150,
  height: 150,
  src: "http://via.placeholder.com/250x150",
  // Show a border around the image (just for demonstration purposes)
  styles: (props) => ({
    root: { border: "1px solid " + props.theme.palette.neutralSecondary },
  }),
};

const dropdownStyles: Partial<IDropdownStyles> = { dropdown: { width: 300 } };

const dropdownControlledExampleOptions = [
  {
    key: "type",
    text: "Leave Type",
    itemType: DropdownMenuItemType.Header,
  },
  { key: "cl", text: "CL" },
  { key: "sl", text: "SL" },
  { key: "ph", text: "PH" },
  { key: "el", text: "EL" },
  { key: "comOff", text: "Comm. Off" },
];

export default class EmpReqForm extends React.Component<
  IEmpReqFormProps,
  { selectedItem; commOff: boolean }
> {
  // dummy function to kickstart jquery
  private GetIPAddress(): void {
    var call = $.ajax({
      url: "https://api.ipify.org/?format=json",
      method: "GET",
      async: false,
      dataType: "json",
      success: (data) => {
        console.log("IP Address : " + data.ip);
        // ipaddress = data.ip;
      },
      error: (textStatus, errorThrown) => {
        console.log(
          "Ip Address fetch failed : " + textStatus + "--" + errorThrown
        );
      },
    }).responseJSON;
  }

  public handleDropdownChange = (
    event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption
  ): void => {
    this.setState({
      selectedItem: item.key,
    });
    console.log(this.state.selectedItem);
    // if (this.state.selectedItem == "grape") {
    //   this.setState({
    //     commOff: false,
    //   });

    //   console.log(
    //     "Comm. off feilds should be visible now! ",
    //     this.state.commOff
    //   );
    // } else {
    //   this.setState({
    //     commOff: true,
    //   });
    // }
  };

  constructor(props: IEmpReqFormProps, state: any) {
    super(props);
    this.state = {
      selectedItem: "cl",
      commOff: true,
    };
  }

  public render(): React.ReactElement<IEmpReqFormProps> {
    return (
      <div id="container">
        <div className="loading" style={{ display: "none" }} id="loader">
          Loading&#8230;
        </div>
        <form id="frm">
          <div className="row">
            <div className="col-lg-12">
              <ul className="nav nav-tabs">
                <li className="active">
                  <a data-toggle="tab" href="#overview">
                    Overview
                  </a>
                </li>
                <li>
                  <a data-toggle="tab" href="#new-application">
                    New Application
                  </a>
                </li>
                <li>
                  <a data-toggle="tab" href="#history">
                    History
                  </a>
                </li>
              </ul>

              <div className="tab-content">
                {/* Overview */}
                <div
                  id="overview"
                  className="tab-pane fade in active ui-tabs-panel ui-widget-content ui-corner-bottom"
                >
                  <div className="panel panel-default">
                    <div className="panel-body">
                      <div className="row top-buffer">
                        <div className="col-sm-4">
                          <div className="form-group">
                            <TextField
                              label="Name"
                              readOnly
                              defaultValue="Risav Chatterjee"
                            />
                            <TextField
                              label="Designation"
                              readOnly
                              defaultValue="Apprentice"
                            />
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="form-group">
                            <TextField
                              label="Department"
                              readOnly
                              defaultValue="Development"
                            />

                            <TextField
                              label="Email"
                              readOnly
                              defaultValue="xyz@gmail.com"
                            />
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="form-group">
                            <Image
                              {...imageProps}
                              alt="Example with no image fit value and no height or width is specified."
                            />
                          </div>
                        </div>

                        <div className="row top-buffer">
                          <div className="col-lg-6">
                            <div className="form-group">
                              <TextField
                                label="Shift"
                                readOnly
                                defaultValue="Day"
                              />
                              <TextField
                                label="Manager In-Charge"
                                readOnly
                                defaultValue="Abhijeet sir"
                              />
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <TextField
                              label="Mobile No"
                              readOnly
                              defaultValue="1234567890"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row top-buffer">
                        <div className="col-lg-4">
                          <div className="form-group">
                            <label htmlFor="txtName">
                              Total Leaves Left :{" "}
                            </label>
                            {" 9000+ "}
                            {/* {this.state.Completed_Activities}/
                            {this.state.Total_Activities} */}
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>Application Status : </label>
                            {" Nil "}
                            {/* <Rating
                              initialRating={this.state.Average_Score}
                              readonly
                              emptySymbol="fa fa-star-o fa-2x"
                              fullSymbol="fa fa-star fa-2x"
                            /> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Application */}
                <div
                  id="new-application"
                  className="tab-pane fade in ui-tabs-panel ui-widget-content ui-corner-bottom"
                >
                  <div className="panel panel-default">
                    <div className="panel-body">
                      {/* Leave type dropdown */}
                      <div className="row top-buffer">
                        <div className="col-lg-2">
                          <div className="form-group">
                            <Dropdown
                              label="Leave Type"
                              selectedKey={this.state.selectedItem}
                              // eslint-disable-next-line react/jsx-no-bind
                              onChange={this.handleDropdownChange}
                              placeholder="Select an option"
                              options={dropdownControlledExampleOptions}
                              styles={dropdownStyles}
                            />
                            {/* <Dropdown
                              options={this.state.Weeks}
                              id="ddlWeeks"
                              onChange={this._onchangeWeek}
                            /> */}
                          </div>
                        </div>
                      </div>

                      {/* Datepicker leave start and end  */}
                      <div className="row top-buffer">
                        <div className="col-lg-6">
                          <div className="form-group">
                            <DatePicker
                              label="Select Leave Start Date"
                              placeholder="Select a date..."
                              ariaLabel="Start Date"
                              // DatePicker uses English strings by default. For localized apps, you must override this prop.
                              strings={defaultDatePickerStrings}
                              // value={this.state.startDate}
                            />
                            {/* <TextField
                              multiline={true}
                              disabled
                              rows={5}
                              defaultValue={this.state.Selected_Activity}
                              // eslint-disable-next-line react/jsx-no-bind
                              // onChange={onChange}
                            /> */}
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="form-group">
                            <DatePicker
                              label="Select Leave End Date"
                              placeholder="Select a date..."
                              ariaLabel="End Date"
                              // DatePicker uses English strings by default. For localized apps, you must override this prop.
                              strings={defaultDatePickerStrings}
                              // value={this.state.startDate}
                            />
                            {/* <TextField
                              multiline={true}
                              disabled
                              rows={5}
                              defaultValue={this.state.Selected_Activity}
                              // eslint-disable-next-line react/jsx-no-bind
                              // onChange={onChange}
                            /> */}
                          </div>
                        </div>
                      </div>

                      {/* Datepicker return date */}
                      <div className="row top-buffer">
                        <div className="col-lg-8">
                          <div className="form-group">
                            <DatePicker
                              label="Select Return Date"
                              placeholder="Select a date..."
                              ariaLabel="Return Date"
                              // DatePicker uses English strings by default. For localized apps, you must override this prop.
                              strings={defaultDatePickerStrings}
                              // value={this.state.startDate}
                            />
                            {/* <TextField
                              multiline={true}
                              disabled
                              rows={5}
                              defaultValue={this.state.Selected_Activity}
                              // eslint-disable-next-line react/jsx-no-bind
                              // onChange={onChange}
                            /> */}
                          </div>
                        </div>
                      </div>

                      {/* Purpose of leave */}
                      <div className="row top-buffer">
                        <div className="col-lg-12">
                          <div className="form-group">
                            <TextField
                              label="Purpose of Leave"
                              multiline={true}
                              // eslint-disable-next-line react/jsx-no-bind
                              // onChange={onChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Comm. Off render component */}
                      {this.state.selectedItem == "comOff" ? <CommOff /> : null}
                      {/* Document Upload */}
                      <div className="row top-buffer">
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label htmlFor="txtName">Upload Document</label>
                            <input
                              type="file"
                              id="txtFile"
                              name="txtFile"
                              style={{
                                border: "1px solid darkgrey",
                                borderRadius: "5px",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Emergency contact no */}
                      <div className="row top-buffer">
                        <div className="form-group">
                          {/* <h3>
                            Emergency
                            <small className="text-muted">
                              Contact Details
                            </small>
                          </h3> */}

                          <div className="col-lg-12">
                            <TextField
                              label="Emergency Contact number"
                              // eslint-disable-next-line react/jsx-no-bind
                              // onChange={onChange}
                            />
                          </div>
                          <div className="col-lg-12">
                            <TextField
                              multiline={true}
                              label="Address"
                              // eslint-disable-next-line react/jsx-no-bind
                              // onChange={onChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit button */}
                      <div className="row top-buffer">
                        <div className="col-lg-12 text-center">
                          <br />
                          <PrimaryButton
                            text="Submit"
                            // onClick={_alertClicked}
                            allowDisabledFocus
                            // disabled={disabled}
                            // checked={checked}
                          />
                        </div>
                      </div>

                      {/* <br />
                      <h4>Past Submissions</h4>
                      <div className="row top-buffer">
                        <div className="col-lg-2">
                          <b>Week</b>
                        </div>
                        <div className="col-lg-4">
                          <b>Filename</b>
                        </div>
                        <div className="col-lg-2">
                          <b>Uploaded On</b>
                        </div>
                        <div className="col-lg-2">
                          <b>Action</b>
                        </div>
                      </div> */}
                      {/* {this.renderAttachments()} */}
                    </div>
                  </div>
                </div>

                {/* History */}
                <div
                  id="history"
                  className="tab-pane fade in ui-tabs-panel ui-widget-content ui-corner-bottom"
                >
                  <div className="panel panel-default">
                    <div className="panel-body">
                      <div className="row top-buffer">
                        <div className="col-lg-2">
                          <b>Date Applied</b>
                        </div>
                        <div className="col-lg-2">
                          <b>Leave Type</b>
                        </div>
                        <div className="col-lg-2">
                          <b>Status</b>
                        </div>
                        <div className="col-lg-6">
                          <b>Remarks</b>
                        </div>
                      </div>
                      {/* {this.renderActivities()} */}
                      {/* <div className="row top-buffer">
                        <div className="col-lg-1">
                          1
                        </div>
                        <div className="col-lg-4">
                          Test Activity 1
                        </div>
                        <div className="col-lg-2">
                          Yes - 11/06/2021
                        </div>
                        <div className="col-lg-2">
                          <Rating
                            initialRating={3}
                            readonly
                            emptySymbol="fa fa-star-o fa-2x"
                            fullSymbol="fa fa-star fa-2x"
                          />
                        </div>
                        <div className="col-lg-3">
                          Test Comments
                        </div>
                      </div>
                      <div className="row top-buffer">
                        <div className="col-lg-1">
                          1
                        </div>
                        <div className="col-lg-4">
                          Test Activity 1
                        </div>
                        <div className="col-lg-2">
                          Yes - 11/06/2021
                        </div>
                        <div className="col-lg-2">
                          <Rating
                            initialRating={0}
                            readonly
                            emptySymbol="fa fa-star-o fa-2x"
                            fullSymbol="fa fa-star fa-2x"
                          />
                        </div>
                        <div className="col-lg-3">
                          Test Comments
                        </div>
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}
