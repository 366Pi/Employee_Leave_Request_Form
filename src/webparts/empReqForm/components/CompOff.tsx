import * as React from "react";
import { useState } from "react";
import {
  TextField,
  DatePicker,
  defaultDatePickerStrings,
} from "@fluentui/react";

const CompOff = (props) => {
  {
    /* If Comm. Off then enable fields */
  }

  const handleOccasionChange = (event) => {
    let val = event.target.value;

    console.log("child component obj: ", val);
    props.onSelectCommOff1(val);
  };

  const handleOccasionDate = (date: Date | null | undefined): void => {
    console.log("child component obj: ", date);
    props.onSelectCommOff2(date);
  };

  return (
    <div className="row top-buffer">
      {/* <h4 className="text-decoration-underline">
                            For Comm. off
                          </h4> */}
      <div className="col-lg-6">
        <div className="form-group">
          <DatePicker
            label="Past holiday date"
            placeholder="Select a date..."
            ariaLabel="Select"
            // DatePicker uses English strings by default. For localized apps, you must override this prop.
            strings={defaultDatePickerStrings}
            // value={this.state.startDate}
            onSelectDate={handleOccasionDate}
          />
        </div>
      </div>

      <div className="col-lg-6">
        <div className="form-group">
          <TextField
            label="Occasion"
            // defaultValue={this.state.Selected_Activity}
            // eslint-disable-next-line react/jsx-no-bind
            onChange={handleOccasionChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CompOff;
