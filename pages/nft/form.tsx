import * as React from "react";
import { Formik, Form, Field } from "formik";

interface MyFormValues {
  cid: string;
  amount: string;
}

const MintForm: React.FC<{
  onSubmit: (cid: string, amount: string) => void;
}> = ({ onSubmit }) => {
  const initialValues: MyFormValues = { cid: "", amount: "0.1" };

  return (
    <div>
      <h1>Mint NFT.</h1>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          onSubmit(values.cid, values.amount);
          actions.setSubmitting(false);
        }}
      >
        <Form>
          <label htmlFor="firstName">CID</label>
          <Field id="cid" name="cid" placeholder="CID" />
          <label htmlFor="firstName">ETH Amount</label>
          <Field id="amount" name="amount" placeholder="ETH Amount" />
          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
};

export default MintForm;
