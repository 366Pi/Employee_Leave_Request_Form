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
  MessageBar,
  MessageBarType,
  BaseButton,
  Button,
  addYears,
  addDays,
} from "@fluentui/react";

import CommOff from "./CompOff";
import ErrorMessage from "./ErrorMessage";
import PendingItemsList from "./PendingItemsList";

import { MSGraphClient } from "@microsoft/sp-http";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { Web } from "@pnp/sp/webs";
import { sp } from "@pnp/sp";
import { IItemAddResult } from "@pnp/sp/items";

import "@pnp/sp/lists";
import "@pnp/sp/items";

import { graph } from "@pnp/graph";
import "@pnp/graph/users";
import "@pnp/graph/photos";

// specify css which comes with bootstrap and fontawesome
// faced problems using require and giving absolute path of css files
// system could not find the files
SPComponentLoader.loadCss(
  "https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css"
);
SPComponentLoader.loadCss(
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
);

require("bootstrap");

const imageProps: Partial<IImageProps> = {
  imageFit: ImageFit.centerContain,
  width: 150,
  height: 150,
  src: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png/250x150",
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
  { key: "CL", text: "CL" },
  { key: "SL", text: "SL" },
  { key: "EL", text: "EL" },
  { key: "Comp_Off", text: "Comm. Off" },
  { key: "Leave_Without_Pay", text: "Leave Without Pay" },
  { key: "ML", text: "ML" },
  { key: "PL", text: "PL" },
];

export interface BalLeftBlueprintObj {
  CL: any;
  SL: any;
  EL: any;
  Comp_Off: any;
  Leave_Without_pay: any;
  // ML: any;
  // PL: any;
  PH: any;
  Total: any;
}

export interface PendingLeaves {
  Leave_Type: any;
  No_Of_Days: any;
  Leave_From: any;
  Leave_To: any;
  Return_On: any;
  Purpose: any;
  Status: any;
  Pending_Id: any;
}

export default class EmpReqForm extends React.Component<
  IEmpReqFormProps,
  {
    selectedItem;
    commOff: boolean;
    empName: any;
    empId: any;
    empEmail: any;
    empDept: any;
    empDesignation: any;
    empMobileNo: any;
    empShift: any;
    manager: any;
    managerEmail: any;

    // Action Items
    leaveType: any;
    leaveStartDate: any;
    leaveEndDate: any;
    returnDate: any;
    leavePurpose: any;
    emergencyContact: any;
    emergencyAddress: any;
    commDate: any;
    commOccasion: any;
    leaveTypesDropdownOptions: any;
    employee: any;
    assigned_to_person: any;
    pendingFlag: any;

    // balance leaves
    balLeavesObj: BalLeftBlueprintObj;
    showIncomplete: any;
    No_Of_Days: any;
    greedy: any;

    minStartDate: any;
    maxEndDate: any;
    Max_Consecutive_Days: any;
    imageUrl: any;
    pendingLeaves: PendingLeaves[];

    commOffDropdownOptions: any;
    commOffObj: any;
  }
> {
  // required in production
  w = Web(this.props.webUrl);

  // required in local
  // w = Web(this.props.webUrl + "/sites/Maitri");

  url = location.search;
  params = new URLSearchParams(this.url);
  id = this.params.get("spid");
  today = new Date(Date.now());

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

  private GetSundayCountBetweenDates = (startDate, endDate) => {
    let totalWeekends = 0;
    for (let i = startDate; i <= endDate; i.setDate(i.getDate() + 1)) {
      if (i.getDay() == 0 || i.getDay() == 1) totalWeekends++;
    }
    return totalWeekends;
  };

  private _temp: BalLeftBlueprintObj = {
    CL: 0,
    SL: 0,
    EL: 0,
    Comp_Off: 0,
    Leave_Without_pay: 0,
    // ML: 0,
    // PL: 0,
    PH: 0,
    Total: 0,
  };

  private _pendingLeavesTemp: PendingLeaves[];

  constructor(props: IEmpReqFormProps, state: any) {
    super(props);

    this._pendingLeavesTemp = [];
    this.state = {
      selectedItem: "cl",
      commOff: true,
      empName: undefined,
      empId: undefined,
      empEmail: undefined,
      empMobileNo: undefined,
      empDept: undefined,
      empDesignation: "Junior Developer",
      empShift: "Day",
      manager: "Test User 2",
      managerEmail: undefined,

      leaveType: undefined,
      leaveStartDate: undefined,
      leaveEndDate: undefined,
      returnDate: undefined,
      leavePurpose: undefined,
      emergencyContact: undefined,
      emergencyAddress: undefined,
      commDate: undefined,
      commOccasion: undefined,
      leaveTypesDropdownOptions: [],
      employee: undefined,
      assigned_to_person: undefined,
      pendingFlag: false,

      balLeavesObj: this._temp,
      showIncomplete: false,
      No_Of_Days: 0,
      greedy: false,

      minStartDate: undefined,
      maxEndDate: undefined,
      Max_Consecutive_Days: undefined,
      imageUrl:
        "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_640.png/250x150",
      pendingLeaves: this._pendingLeavesTemp,
      commOffDropdownOptions: [],
      commOffObj: undefined,
    };
  }

  public handleDropdownChange = (
    event: React.FormEvent<HTMLDivElement>,
    item: any
  ): void => {
    this.setState(
      {
        selectedItem: item.key,
        leaveType: item.text,
        leaveStartDate: undefined,
        leaveEndDate: undefined,
        No_Of_Days: undefined,
        Max_Consecutive_Days: item.Max_Consecutive_Days,
      },
      () => {
        console.log(
          "Inside Dropdown: ",
          this.state.selectedItem,
          " ",
          this.state.leaveType
        );
        let minDate = addDays(this.today, item.Apply_Before_Days);
        if (minDate.getDay() === 0) minDate = addDays(minDate, 1);
        const tempDate = minDate;

        // the problem is with getSundayCountFunction

        // console.log(
        //   "Max_Consecutive_Days: ",
        //   item.Max_Consecutive_Days,
        //   " ",
        //   maxDate
        // );
        // implementing Apply_Before_Days
        if (
          this.state.selectedItem === "3 CL" ||
          this.state.selectedItem === "5 EL" ||
          this.state.selectedItem === "8 ML" ||
          this.state.selectedItem === "9 PL"
        ) {
          console.log(
            "CL selected",
            minDate,
            "\nApply_Before_Days: ",
            item.Apply_Before_Days
          );
          this.setState({ minStartDate: minDate });
        } else if (this.state.selectedItem === "4 SL") {
          minDate = addDays(this.today, -item.Max_Post_Request_Days);
          console.log(this.today, item.Max_Post_Request_Days);

          this.setState({ minStartDate: minDate });
        } else if (this.state.selectedItem === "7 Leave_Without_Pay") {
          this.setState({ minStartDate: this.today });
        } else {
          this.setState({ minStartDate: undefined });
        }
      }
    );
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

  private handleStartDateChange = (date: Date | null | undefined): void => {
    this.setState(
      {
        leaveStartDate: date,
        leaveEndDate: undefined,
      },
      () => {
        if (this.state.leaveEndDate != undefined) {
          const dayDiff =
            (this.state.leaveEndDate - this.state.leaveStartDate) /
              (1000 * 60 * 60 * 24) +
            1;
          this.setState({
            No_Of_Days: dayDiff,
          });
        }

        // implementing Max_Consecutive_Days
        let maxDate = addDays(
          this.state.leaveStartDate,
          this.state.Max_Consecutive_Days - 1
        );
        // CL and EL could be taken in chunks with min days as 1
        if (
          this.state.selectedItem === "3 CL" ||
          this.state.selectedItem === "5 EL"
        ) {
          this.setState({ maxEndDate: maxDate });
        } else if (this.state.selectedItem === "4 SL") {
          maxDate = addDays(
            this.state.leaveStartDate,
            this.state.balLeavesObj.SL - 1
          );
          this.setState({ maxEndDate: maxDate });
        } else if (this.state.selectedItem === "6 Comp_Off") {
          this.setState({ maxEndDate: this.state.leaveStartDate });
          this.handleEndDateChange(this.state.leaveStartDate);
        } else if (
          // ML and PL would have to take all in a bunch
          this.state.selectedItem === "8 ML" ||
          this.state.selectedItem === "9 PL"
        ) {
          this.setState({ leaveEndDate: maxDate, maxEndDate: maxDate }, () => {
            this.handleEndDateChange(maxDate);
          });
        } else {
          this.setState({ maxEndDate: undefined });
        }
      }
    );
  };

  private handleEndDateChange = (date: Date | null | undefined): void => {
    this.setState(
      {
        leaveEndDate: date,
        returnDate: undefined,
      },
      () => {
        if (this.state.leaveStartDate != undefined) {
          const dayDiff =
            (this.state.leaveEndDate - this.state.leaveStartDate) /
              (1000 * 60 * 60 * 24) +
            1;
          this.setState({
            No_Of_Days: dayDiff,
          });
        }
      }
    );
  };

  private handleReturnDateChange = (date: Date | null | undefined): void => {
    this.setState({
      returnDate: date,
    });
  };

  private handleLeavePurpose = (event) => {
    this.setState({
      leavePurpose: event.target.value,
    });
    // console.log(this.state.leavePurpose);
  };

  private handleEmergencyContact = (event) => {
    this.setState({
      emergencyContact: event.target.value,
    });
    // console.log(this.state.emergencyContact);
  };

  private handleEmergencyAddress = (event) => {
    this.setState({
      emergencyAddress: event.target.value,
    });
    // console.log(this.state.emergencyAddress);
  };

  private handleCommOffOccasion = (val: any) => {
    this.setState(
      {
        commOccasion: val,
      },
      () => {
        console.log(
          "in parent: ",
          this.state.commOccasion,
          " ",
          this.state.commDate
        );
      }
    );
  };

  private handleCommOffDate = (date: Date | null | undefined) => {
    this.setState(
      {
        commDate: date,
      },
      () => {
        console.log(
          "in parent: ",
          this.state.commOccasion,
          " ",
          this.state.commDate
        );
      }
    );
  };

  private handleGreedyMsg = (
    ev?: React.MouseEvent<HTMLElement | BaseButton | Button>
  ) => {
    this.setState({ greedy: false });
  };

  private handleCommOffDropdown = (
    event: React.FormEvent<HTMLDivElement>,
    option: IDropdownOption,
    index?: number
  ) => {
    this.setState({ commOffObj: option }, () => {
      console.log(this.state.commOffObj);
    });
  };

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
                    Leave Summary
                  </a>
                </li>
                <li>
                  <a data-toggle="tab" href="#cancel">
                    Cancel Leaves
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
                              value={this.state.empName}
                            />
                            <TextField
                              label="Designation"
                              readOnly
                              value={this.state.empDesignation}
                            />
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div className="form-group">
                            <TextField
                              label="Department"
                              readOnly
                              value={this.state.empDept}
                            />

                            <TextField
                              label="Email"
                              readOnly
                              value={this.state.empEmail}
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
                                value={this.state.empShift}
                              />
                              <TextField
                                label="Manager In-Charge"
                                readOnly
                                value={this.state.manager}
                              />
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <TextField
                              label="Mobile No"
                              readOnly
                              value={this.state.empMobileNo}
                            />
                          </div>
                        </div>
                      </div>
                      {/* 
                      <div className="row top-buffer">
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>Application Status : </label>
                            {" NA "}
                          </div>
                        </div>
                      </div>
                     */}
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
                      {this.state.showIncomplete ? <ErrorMessage /> : null}

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
                              options={this.state.leaveTypesDropdownOptions}
                              styles={dropdownStyles}
                              required
                            />
                            {/* <Dropdown
                              options={this.state.Weeks}
                              id="ddlWeeks"
                              onChange={this._onchangeWeek}
                            /> */}
                          </div>
                        </div>
                      </div>

                      {/* Datepicker leave start, end and return  */}
                      <div className="row top-buffer">
                        {/* leave start */}
                        <div className="col-lg-4">
                          <div className="form-group">
                            <DatePicker
                              label="Select Leave Start Date"
                              placeholder="Select a date..."
                              ariaLabel="Start Date"
                              // DatePicker uses English strings by default. For localized apps, you must override this prop.
                              strings={defaultDatePickerStrings}
                              value={this.state.leaveStartDate}
                              onSelectDate={this.handleStartDateChange}
                              isRequired
                              minDate={this.state.minStartDate}
                              maxDate={
                                this.state.selectedItem === "4 SL"
                                  ? this.today
                                  : undefined
                              }
                            />
                          </div>
                        </div>

                        {/* leave end */}
                        <div className="col-lg-4">
                          <div className="form-group">
                            <DatePicker
                              label="Select Leave End Date"
                              placeholder="Select a date..."
                              ariaLabel="End Date"
                              // DatePicker uses English strings by default. For localized apps, you must override this prop.
                              strings={defaultDatePickerStrings}
                              value={this.state.leaveEndDate}
                              onSelectDate={this.handleEndDateChange}
                              isRequired
                              minDate={this.state.leaveStartDate}
                              maxDate={this.state.maxEndDate}
                              disabled={
                                this.state.selectedItem === "8 ML" ||
                                this.state.selectedItem === "9 PL" ||
                                this.state.leaveStartDate === undefined
                                  ? true
                                  : false
                              }
                            />
                          </div>
                        </div>

                        {/* return date */}
                        <div className="col-lg-4">
                          <div className="form-group">
                            <DatePicker
                              label="Select Return Date"
                              placeholder="Select a date..."
                              ariaLabel="Return Date"
                              // DatePicker uses English strings by default. For localized apps, you must override this prop.
                              strings={defaultDatePickerStrings}
                              value={this.state.returnDate}
                              onSelectDate={this.handleReturnDateChange}
                              isRequired
                              minDate={this.state.leaveEndDate}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Calculated Total days leave */}
                      <div className="row top-buffer">
                        <div className="form-group">
                          <div className="col-lg-4">
                            <TextField
                              label="Calculated Total days"
                              // eslint-disable-next-line react/jsx-no-bind
                              value={this.state.No_Of_Days}
                              readOnly
                            />
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
                              onChange={this.handleLeavePurpose}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Comm. Off render component */}
                      {this.state.selectedItem == "6 Comp_Off" ? (
                        <div className="row top-buffer">
                          <div className="col-lg-12">
                            <div className="form-group">
                              <Dropdown
                                placeholder="Select an option"
                                label="Select from Granted Comm Offs"
                                options={this.state.commOffDropdownOptions}
                                // styles={dropdownStyles}
                                onChange={this.handleCommOffDropdown}
                              />
                            </div>
                          </div>
                        </div>
                      ) : null}

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
                              onChange={this.handleEmergencyContact}
                              required
                            />
                          </div>
                          <div className="col-lg-12">
                            <TextField
                              multiline={true}
                              label="Address"
                              // eslint-disable-next-line react/jsx-no-bind
                              onChange={this.handleEmergencyAddress}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Document Upload */}
                      {/* <div className="row top-buffer">
                        <div className="col-lg-12">
                          <div className="form-group">
                            <br />
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
                      </div> */}

                      {/* Submit button */}
                      <div className="row top-buffer">
                        <div className="col-lg-12 text-center">
                          <br />
                          <PrimaryButton
                            text="Submit"
                            onClick={this.handleOnSubmit}
                            allowDisabledFocus
                            disabled={this.state.pendingFlag}
                            // checked={checked}
                          />
                        </div>
                      </div>

                      {/* error message when more leaves are requested */}
                      <div className="row top-buffer">
                        <div className="col-lg-12 text-center">
                          <br />
                          {this.state.greedy ? (
                            <MessageBar
                              messageBarType={MessageBarType.error}
                              isMultiline={false}
                              onDismiss={this.handleGreedyMsg}
                            >
                              Requested leave type balance is less than
                              required.
                            </MessageBar>
                          ) : null}
                        </div>
                      </div>
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
                        <div className="col-lg-6">
                          <div className="form-group">
                            <table className="table table-borderless table-hover">
                              <thead>
                                <tr>
                                  <th scope="col">Leave Type</th>
                                  <th scope="col">Number</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <th scope="row">CL</th>
                                  <td>{this.state.balLeavesObj.CL}</td>
                                </tr>
                                <tr>
                                  <th scope="row">SL</th>
                                  <td>{this.state.balLeavesObj.SL}</td>
                                </tr>
                                <tr>
                                  <th scope="row">EL</th>
                                  <td>{this.state.balLeavesObj.EL}</td>
                                </tr>
                                <tr>
                                  <th scope="row">Commp. Off</th>
                                  <td>{this.state.balLeavesObj.Comp_Off}</td>
                                </tr>
                                <tr>
                                  <th scope="row">PH</th>
                                  <td>{this.state.balLeavesObj.PH}</td>
                                </tr>
                                <tr className="table-primary">
                                  <th scope="row">Total</th>
                                  <td className="table-dark">
                                    {this.state.balLeavesObj.Total}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancel Leaves */}
                <div
                  id="cancel"
                  className="tab-pane fade in ui-tabs-panel ui-widget-content ui-corner-bottom"
                >
                  <div className="panel panel-default">
                    <div className="panel-body">
                      <div className="row top-buffer">
                        <div className="col-lg-12">
                          <div className="form-group">
                            <table className="table table-borderless table-hover">
                              <thead>
                                <tr>
                                  <th scope="col">Leave Type</th>
                                  <th scope="col">Leave From</th>
                                  <th scope="col">Leave To</th>
                                  <th scope="col">Number of Days</th>
                                  <th scope="col">Return On</th>
                                  <th scope="col">Purpose</th>
                                  <th scope="col">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {this.state.pendingLeaves.map((item) => (
                                  <PendingItemsList item={item} w={this.w} />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
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

  public componentDidMount() {
    this.getEmpData();
    this.getDropdownOptions();
  }

  private getPendingRequests = () => {
    // get all the pending leave req for the logged in user
    // get all the items from a list

    let _leaveTypeFull: any;
    this.w.lists
      .getByTitle("Leave_Requests")
      .items.get()
      .then((items: any[]) => {
        items.map((el) => {
          if (this.state.empId === el.Employee_ID && el.Status === "Pending") {
            // get a specific item by id
            this.w.lists
              .getByTitle("Leave_Types")
              .items.getById(el.Leave_TypeId)
              .get()
              .then((item: any) => {
                // console.log("Leave type Item is ", item.Leave_Type_Full);
                _leaveTypeFull = item.Leave_Type_Full;
              })
              .then(() => {
                this.setState({
                  pendingLeaves: [
                    ...this.state.pendingLeaves,
                    {
                      Leave_Type: _leaveTypeFull,
                      Leave_From: el.Leave_From,
                      Leave_To: el.Leave_To,
                      Return_On: el.Return_On,
                      Purpose: el.Purpose,
                      Status: el.Status,
                      Pending_Id: el.Id,
                      No_Of_Days: el.No_of_days,
                    },
                  ],
                });
              })
              .then(() => {
                console.log(this.state.pendingLeaves);
              })
              .then(() => {
                console.log("Now everything is done!");
              });
          }
        });
      });
  };

  // Pass logged in user's emailID to this function to get his userID
  // which will be pushed to the EmployeeId list col
  private GetUserId(userName) {
    // required in production
    var siteUrl = this.props.webUrl;

    // required in local
    // var siteUrl = this.props.webUrl + "/sites/Maitri";

    // console.log("siteUrl", siteUrl);

    var enclogin = encodeURIComponent(userName);

    var call = $.ajax({
      // url:
      //   siteUrl +
      //   "/_api/web/siteusers/getbyloginname(@v)?@v=%27" +
      //   enclogin +
      //   "%27",

      url:
        siteUrl +
        "/_api/web/siteusers/getbyloginname(@v)?@v=%27i:0%23.f|membership|" +
        userName +
        "%27",

      method: "GET",

      headers: { Accept: "application/json; odata=verbose" },

      async: false,

      dataType: "json",
    }).responseJSON;

    // console.log("Call : " + JSON.stringify(call));

    return call;
  }

  private getEmpData = async (): Promise<void> => {
    // Makes a graph api call to fetch logged in user's data from Azure AD

    // preventDefault();
    // console.log("webpart context is: ", this.props.context);

    this.props.context.msGraphClientFactory
      .getClient()
      .then((client: MSGraphClient) => {
        client
          .api("/me")
          .select(
            "displayName,department,mail,mobilePhone,manager,jobTitle,employeeId"
          )
          .get()
          .then((res) => {
            // console.log(
            //   `${res.displayName}, ${res.department}, ${res.mail}, ${res.mobilePhone}, ${res.employeeId}`
            // );
            this.setState(
              {
                empName: res.displayName,
                empId: res.employeeId,
                empDept: res.department,
                empDesignation: res.jobTitle,
                empEmail: res.mail,
                empMobileNo: res.mobilePhone,
              },
              () => {
                const obj = this.GetUserId(this.state.empEmail);
                this.setState({ employee: obj.d.Id }, () => {
                  console.log("EmployeeId: ", this.state.employee);
                });
              }
            );
          })
          .then(() => {
            this.getBalLeaveData();
          })
          .then(() => {
            this.getPendingRequests();
          })
          .then(() => {
            this.getCommOffData();
          })
          .catch((err) => {
            console.log("🔥 There was an error 🧯 ", err);
          });
      });

    this.props.context.msGraphClientFactory
      .getClient()
      .then((client: MSGraphClient) => {
        client
          .api("/me/manager")
          .select("")
          .get()
          .then((res) => {
            // console.log(`${res.displayName}`);
            this.setState(
              {
                manager: res.displayName,
                managerEmail: res.mail,
              },
              () => {
                const obj = this.GetUserId(this.state.managerEmail);
                this.setState({ assigned_to_person: obj.d.Id }, () => {
                  // console.log(
                  //   "email: ",
                  //   this.state.managerEmail,
                  //   " Id: ",
                  //   this.state.assigned_to_person
                  // );
                });
              }
            );
          })
          .catch((err) => {
            console.log("🔥 There was an error 🧯 ", err);
          });
      });

    // this.props.context.msGraphClientFactory
    //   .getClient()
    //   .then((client: MSGraphClient) => {
    //     client
    //       .api("/me/photo/$value")
    //       .responseType("blob")
    //       .get()
    //       .then((img) => {
    //         const xrl = window.URL || window.webkitURL;
    //         const blobUrl = xrl.createObjectURL(img);
    //         console.log("result for calling the photo ", blobUrl);
    //         // console.log("inside then: \n");

    //         // console.log(img.dat);
    //       })
    //       .catch((err) => {
    //         console.log("The error message is: \n", err);
    //       });
    //   });

    // const currentUser = await graph.me.photo();
    // console.log(currentUser);
  };

  private getCommOffData = () => {
    console.log("Fetching the comm off data");
    // get all the items from a list
    this.w.lists
      .getByTitle("CommOff_Master")
      .items.get()
      .then((items: any[]) => {
        let i = 1;
        items.map((el) => {
          if (
            el.EmployeeID === this.state.empId &&
            el.Status === "Not-Availed"
          ) {
            const dt = new Date(el.Grant_Against_Date);
            const date = this.getDate(dt);
            this.setState({
              commOffDropdownOptions: [
                ...this.state.commOffDropdownOptions,
                {
                  key: el.ID,
                  text: i + ".    " + date + "    " + el.Occasion,
                  date: new Date(date),
                  occasion: el.Occasion,
                },
              ],
            });
            console.log(date, " ", el.Occasion);
            console.log(el);
            i++;
          }
        });
      });
  };

  private getDate = (dt) => {
    const date =
      dt.getFullYear() +
      "-" +
      ("" + (dt.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + dt.getDate()).slice(-2);

    return date;
  };

  private postItem = (): void => {
    // add an item to the list
    const leaveTypeArr = this.state.selectedItem.split(" ");
    console.log(this.props.webUrl + "/sites/Maitri", " ", leaveTypeArr);

    this.w.lists
      .getByTitle("Leave_Requests")
      .items.add({
        Employee_Name: this.state.empName,
        Employee_ID: this.state.empId,
        Employee_Email: this.state.empEmail,
        Leave_TypeId: leaveTypeArr[0],
        Leave_From: this.state.leaveStartDate,
        Leave_To: this.state.leaveEndDate,
        No_of_days: this.state.No_Of_Days,
        Return_On: this.state.returnDate,
        Purpose: this.state.leavePurpose,
        Emergency_Contact: this.state.emergencyContact,
        Address: this.state.emergencyAddress,
        EmployeeId: this.state.employee,
        Assigned_To_PersonId: this.state.assigned_to_person,
        Compoff_against_date: this.state.commOffObj.date,
        Compoff_occasion:
          this.state.commOffObj.key + "$" + this.state.commOffObj.occasion,
      })
      .then((iar: IItemAddResult) => {
        console.log(iar);
        alert("New list item created Succesfully 😃");
        window.location.reload();
      })
      .catch((err) => {
        console.log("There was an error 🔥", err);
      });
  };

  private getDropdownOptions = (): void => {
    // get all the items from a list
    this.w.lists
      .getByTitle("Leave_Types")
      .items.get()
      .then((items: any[]) => {
        items.map((el) => {
          if (el.Title != "ML" && el.Title != "PL") {
            this.setState(
              {
                leaveTypesDropdownOptions: [
                  ...this.state.leaveTypesDropdownOptions,
                  {
                    key: el.Id + " " + el.Title,
                    text: String(el.Leave_Type_Full),
                    Apply_Before_Days: el.Apply_Before_Days,
                    Max_Consecutive_Days: el.Max_Consecutive_Days,
                    Max_Post_Request_Days: el.Max_Post_Request_Days,
                  },
                ],
              },
              () => {
                // console.log(
                //   "Inside arr setState: \n",
                //   this.state.leaveTypesDropdownOptions
                // );
              }
            );
          }
          // console.log("el map: ", el.Title);
        });
      });
  };

  private getBalLeaveData = (): void => {
    /*
    fetch the leave master table, search the logged in employeeId.
    and store the items in leaveBalanceLeft array state.

    should be called only after empId state is set
    */

    this.w.lists
      .getByTitle("Leave_Master")
      .items.get()
      .then((items: any[]) => {
        // console.log(items);
        for (let i = 0; i < items.length; i++) {
          if (items[i].Employee_ID == this.state.empId) {
            const temp: BalLeftBlueprintObj = {
              CL: items[i].CL,
              SL: items[i].SL,
              EL: items[i].EL,
              Comp_Off: items[i].Comp_Off,
              Leave_Without_pay: items[i].Leave_Without_Pay,
              PH: items[i].PH,
              Total:
                items[i].CL +
                items[i].SL +
                items[i].EL +
                items[i].Comp_Off +
                items[i].PH,
            };
            this.setState({ balLeavesObj: temp }, () => {
              // console.log(
              //   "Found! ",
              //   items[i].Employee_ID,
              //   " ",
              //   this.state.balLeavesObj
              // );
            });
            break;
          }
        }
      });
  };

  private handleOnSubmit = () => {
    if (
      this.state.leaveType === undefined ||
      this.state.leaveStartDate === undefined ||
      this.state.leaveEndDate === undefined ||
      this.state.returnDate === undefined ||
      this.state.leavePurpose === undefined ||
      this.state.emergencyContact === undefined ||
      this.state.emergencyAddress === undefined
    )
      this.setState({ showIncomplete: true });
    else {
      if (
        this.state.selectedItem === "6 Comp_Off" &&
        this.state.commOffObj === undefined
      )
        this.setState({ showIncomplete: true });
      else {
        const val = this.state.selectedItem.split(" ")[1];
        // console.log(
        //   "inside submit",
        //   this.state.No_Of_Days,
        //   " ",
        //   this.state.balLeavesObj[val]
        // );
        if (this.state.No_Of_Days > this.state.balLeavesObj[val]) {
          this.setState({ greedy: true });
          console.log("Leave bal is less");
        } else {
          this.setState({ showIncomplete: false, greedy: false }, () => {
            this.postItem();
          });
        }
      }
    }
  };
}
