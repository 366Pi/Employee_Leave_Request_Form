import * as React from "react";
import styles from "./EmpReqForm.module.scss";
import { IEmpReqFormProps } from "./IEmpReqFormProps";
import { escape } from "@microsoft/sp-lodash-subset";
// import the reference to jquery.js and bootstrap.js
import * as $ from "jquery";
import * as bootstrap from "bootstrap";
import { SPComponentLoader } from "@microsoft/sp-loader";

// specify css which comes with bootstrap and fontawesome
// faced problems using require and giving absolute path of css files
// system could not find the files
SPComponentLoader.loadCss(
  "https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css"
);
SPComponentLoader.loadCss(
  "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
);

export default class EmpReqForm extends React.Component<IEmpReqFormProps, {}> {
  public render(): React.ReactElement<IEmpReqFormProps> {
    return (
      <div className={styles.empReqForm}>
        <div className={styles.container}>
          <div className={styles.row}>
            <div className={styles.column}>
              <span className={styles.title}>Welcome to SharePoint!</span>
              <p className={styles.subTitle}>
                Customize SharePoint experiences using Web Parts.
              </p>
              <p className={styles.description}>
                {escape(this.props.description)}
              </p>
              <a href="https://aka.ms/spfx" className={styles.button}>
                <span className={styles.label}>Learn more</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
