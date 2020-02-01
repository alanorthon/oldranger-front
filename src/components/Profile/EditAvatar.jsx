import React, { useState, useContext } from 'react';
import { Button, Upload, Icon } from 'antd';
import { Form } from 'formik-antd';
import { Formik } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';

import queries from '../../serverQueries';

import UserContext from '../UserContext';

const StyledWrapper = styled.div`
  > span {
    display: flex;
    width: 100%;
  }
  .ant-upload {
    float: none;
    margin: auto auto 8px;
  }
`;

const validationSchema = Yup.object().shape({
  file: Yup.mixed().required(),
});

const submitForm = async (values, { changeLoadingState, changeUserState }) => {
  changeLoadingState(true);

  const formData = new FormData();
  formData.append('file', values.file);
  await queries.updateAvatar(formData);
  const profile = await queries.getProfileData();

  changeUserState(profile);
  changeLoadingState(false);
};

const EditAvatar = () => {
  const [isLoading, changeLoadingState] = useState(false);
  const { user, changeUserState } = useContext(UserContext);

  return (
    <Formik
      initialValues={{ file: null }}
      validationSchema={validationSchema}
      onSubmit={values => {
        changeLoadingState(true);
        submitForm(values, { changeLoadingState, changeUserState });
      }}
    >
      {({ handleSubmit, setFieldValue }) => (
        <Form onSubmit={handleSubmit}>
          <StyledWrapper>
            <Upload
              disabled={isLoading}
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={({ file }) => {
                setFieldValue('file', file);
                handleSubmit();
              }}
            >
              <img
                src={`http://localhost:8888/img/${user.avatar}`}
                alt="avatar"
                style={{ width: '100%' }}
              />
            </Upload>

            <Upload
              disabled={isLoading}
              customRequest={({ file }) => {
                setFieldValue('file', file);
                handleSubmit();
              }}
            >
              <Button>
                <Icon type="upload" /> Загрузить аватар
              </Button>
            </Upload>
          </StyledWrapper>
        </Form>
      )}
    </Formik>
  );
};

export default EditAvatar;
