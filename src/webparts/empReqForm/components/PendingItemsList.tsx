import * as React from "react";

const getFormattedDate = (date) => {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

function PendingItemsList({ item, w }) {
  const names: any = ["Bruce", "Clark", "Diana"];

  const handleCancelButton = () => {
    if (
      confirm("Are you sure you want to cancel this particular leave request")
    ) {
      // Cancel it!
      w.lists
        .getByTitle("Leave_Requests")
        .items.getById(item.Pending_Id)
        .update({
          Status: "Cancelled",
        })
        .then((i) => {
          alert("Leave was successfully cancelled!");
          window.location.reload();
          console.log(i);
        });
    } else {
      // Do nothing!
      console.log("Leave was not cancelled.");
    }
  };

  // console.log(names);
  return (
    <tr>
      <td>{item.Leave_Type}</td>
      <td>{getFormattedDate(item.Leave_From)}</td>
      <td>{getFormattedDate(item.Leave_To)}</td>
      <td align="center">{item.No_Of_Days}</td>
      <td>{getFormattedDate(item.Return_On)}</td>
      <td>{item.Purpose}</td>
      <td>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCancelButton}
        >
          Cancel
        </button>
      </td>
    </tr>
  );
}

export default PendingItemsList;
