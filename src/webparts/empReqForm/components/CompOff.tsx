import * as React from "react";
import {
  TextField,
  DatePicker,
  defaultDatePickerStrings,
} from "@fluentui/react";
const CompOff = () => {
  {
    /* If Comm. Off then enable fields */
  }
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
          <TextField
            label="Occasion"

            // defaultValue={this.state.Selected_Activity}
            // eslint-disable-next-line react/jsx-no-bind
            // onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default CompOff;
