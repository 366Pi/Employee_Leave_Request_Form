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
} from "@fluentui/react";

import CommOff from "./CompOff";
import ErrorMessage from "./ErrorMessage";

import { MSGraphClient } from "@microsoft/sp-http";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { Web } from "@pnp/sp/webs";
import { sp } from "@pnp/sp";
import { IItemAddResult } from "@pnp/sp/items";

import "@pnp/sp/lists";
import "@pnp/sp/items";

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
  ML: any;
  PL: any;
  Total: any;
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
  }
> {
  w = Web(this.props.webUrl + "/sites/Maitri");
  url = location.search;
  params = new URLSearchParams(this.url);
  id = this.params.get("spid");

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

  private _temp: BalLeftBlueprintObj = {
    CL: 0,
    SL: 0,
    EL: 0,
    Comp_Off: 0,
    Leave_Without_pay: 0,
    ML: 0,
    PL: 0,
    Total: 0,
  };

  constructor(props: IEmpReqFormProps, state: any) {
    super(props);
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
    };
  }

  public handleDropdownChange = (
    event: React.FormEvent<HTMLDivElement>,
    item: IDropdownOption
  ): void => {
    this.setState(
      {
        selectedItem: item.key,
        leaveType: item.text,
      },
      () => {
        console.log(
          "Inside Dropdown: ",
          this.state.selectedItem,
          " ",
          this.state.leaveType
        );
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
      }
    );
  };

  private handleEndDateChange = (date: Date | null | undefined): void => {
    this.setState(
      {
        leaveEndDate: date,
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

                      <div className="row top-buffer">
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label>Application Status : </label>
                            {" NA "}
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
                        <CommOff
                          onSelectCommOff1={this.handleCommOffOccasion}
                          onSelectCommOff2={this.handleCommOffDate}
                        />
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
                      <div className="row top-buffer">
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
                      </div>

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
                              Getting a bit greedy? Eh buddy?!
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
                                  <th scope="row">Leave Without Pay</th>
                                  <td>
                                    {this.state.balLeavesObj.Leave_Without_pay}
                                  </td>
                                </tr>
                                <tr>
                                  <th scope="row">ML</th>
                                  <td>{this.state.balLeavesObj.ML}</td>
                                </tr>
                                <tr>
                                  <th scope="row">PL</th>
                                  <td>{this.state.balLeavesObj.PL}</td>
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
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  public componentDidMount() {
    this.GetIPAddress();
    this.getEmpData();
    this.getDropdownOptions();
  }

  // Pass logged in user's emailID to this function to get his userID
  // which will be pushed to the EmployeeId list col
  private GetUserId(userName) {
    var siteUrl = this.props.webUrl + "/sites/Maitri";

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

  private getEmpData = (): void => {
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
        Leave_TypeId: leaveTypeArr[0],
        Leave_From: this.state.leaveStartDate,
        Leave_To: this.state.leaveEndDate,
        Return_On: this.state.returnDate,
        Purpose: this.state.leavePurpose,
        Emergency_Contact: this.state.emergencyContact,
        Address: this.state.emergencyAddress,
        EmployeeId: this.state.employee,
        Assigned_To_PersonId: this.state.assigned_to_person,
        Compoff_against_date: this.state.commDate,
        Compoff_occasion: this.state.commOccasion,
      })
      .then((iar: IItemAddResult) => {
        console.log(iar);
        alert("New list item created Succesfully 😃");
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
          this.setState(
            {
              leaveTypesDropdownOptions: [
                ...this.state.leaveTypesDropdownOptions,
                {
                  key: el.Id + " " + el.Title,
                  text: String(el.Leave_Type_Full),
                },
              ],
            },
            () => {
              console.log(
                "Inside arr setState: \n",
                this.state.leaveTypesDropdownOptions
              );
            }
          );
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
        console.log(items);
        for (let i = 0; i < items.length; i++) {
          if (items[i].Employee_ID == this.state.empId) {
            const temp: BalLeftBlueprintObj = {
              CL: items[i].CL,
              SL: items[i].SL,
              EL: items[i].EL,
              Comp_Off: items[i].Comp_Off,
              Leave_Without_pay: items[i].Leave_Without_Pay,
              ML: items[i].ML,
              PL: items[i].PL,
              Total:
                items[i].CL +
                items[i].SL +
                items[i].EL +
                items[i].Comp_Off +
                items[i].Leave_Without_Pay +
                items[i].ML +
                items[i].PL,
            };
            this.setState({ balLeavesObj: temp }, () => {
              console.log(
                "Found! ",
                items[i].Employee_ID,
                " ",
                this.state.balLeavesObj
              );
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
        (this.state.commDate === undefined ||
          this.state.commOccasion === undefined)
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
          console.log("Expecting more? Eh buddy?!");
        } else {
          this.setState({ showIncomplete: false, greedy: false }, () => {
            this.postItem();
          });
        }
      }
    }
  };
}
