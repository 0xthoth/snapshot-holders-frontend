import * as React from "react";
import { Formik, Form, Field } from "formik";

interface MyFormValues {
  address: string;
}

const WhitelistForm: React.FC<{
  defaultAddress: string;
  onSubmit: (address: string) => void;
}> = ({ onSubmit, defaultAddress }) => {
  const initialValues: MyFormValues = { address: defaultAddress ?? "" };
  return (
    <div>
      <h1>My Example</h1>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          onSubmit(values.address);
          actions.setSubmitting(false);
        }}
      >
        <Form>
          <label htmlFor="firstName">Address</label>
          <Field id="address" name="address" placeholder="Address" />
          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </div>
  );
};

export default WhitelistForm;
