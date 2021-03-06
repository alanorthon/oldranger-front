import React from 'react';
import { Row, Button, Icon, message, Modal } from 'antd';
import { withRouter } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import queries from '../../../serverQueries';

const DeletePhotoButton = styled(Button)`
  display: none;
  position: absolute;
  padding: 2px 5px;
  top: 0;
  right: 0;
  opacity: 0.8;
`;

const EditPhotoButton = styled(DeletePhotoButton)`
  right: 30px;
`;

const StyledAlbumCard = styled.div`
  position: relative;
  height: 150px;
  width: 239px;
  margin: 3px;
  background-size: cover;
  &:hover ${DeletePhotoButton} {
    display: block;
  }
  @media (max-width: 479px) {
    ${DeletePhotoButton} {
      display: block;
    }
  }
`;
const AlbomShadow = styled.div`
    color: #fff;
    box-sizing: border-box;
    position: absolute; 
    bottom: 0;
    width: 100%;
    padding: 35px 12px 9px;
    background: url(/shadow.png);
}`;
const PhotoCounter = styled.span`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 10px;
  color: #fff;
`;
const AlbomBackgroundImage = styled.img`
  width: 100%;
  height: 100%;
`;
const AlbumTitle = styled.span`
  word-break: break-all;
  position: absolute;
  bottom: 0;
  padding: 10px;
  left: 0;
  color: #fff;
`;

const StyledAlbumWrapper = styled.div`
  display: flex;
  flex-direction: columns;
  flex-wrap: wrap;
  align-content: space-between;
  margin: 30px 0;
  @media (max-width: 1000px) {
    justify-content: center;
  }
`;
const { confirm } = Modal;

class Albums extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: [],
    };
  }

  componentDidMount() {
    this.loadAlbums();
  }

  loadAlbums = async () => {
    const allAlbums = await queries.getAlbums();
    this.setState({ albums: allAlbums });
  };

  createNewAlbum = async () => {
    const { albums } = this.state;
    // eslint-disable-next-line no-alert
    const title = prompt('Название альбома');
    if (!title) {
      /* eslint-disable-next-line no-alert */
      message.error('Необходимо указать название для альбома');
      return;
    }
    try {
      const NewAlbum = await queries.createNewAlbum(title);
      this.setState({ albums: [...albums, NewAlbum] });
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(error.response);
      message.error('что-то пошло не так');
    }
  };

  deleteAlbum = album => async event => {
    const doDeleteAlbum = async () => {
      const { albums } = this.state;
      try {
        await queries.deleteAlbum(album.photoAlbumId);
        const newAlbums = albums.reduce((acc, item) => {
          if (item.photoAlbumId !== album.photoAlbumId) {
            acc.push(item);
          }
          return [...acc];
        }, []);
        this.setState({ albums: newAlbums });
      } catch (error) {
        /* eslint-disable-next-line no-console */
        console.error(error.response);
        message.error('что-то пошло не так');
      }
    };
    event.stopPropagation();
    function showDeleteConfirm() {
      confirm({
        title: 'Подтвердите удаление альбома',
        content: 'Вы уверены, что хотите удалить альбом?',
        okText: 'Да',
        okType: 'danger',
        cancelText: 'Нет',
        onOk() {
          doDeleteAlbum();
        },
        onCancel() {},
      });
    }
    showDeleteConfirm();
  };

  editPhotoAlbum = album => async event => {
    event.stopPropagation();
    const {
      history,
      location: { pathname },
    } = this.props;
    const url = `${pathname}/editAlbum/${album.photoAlbumId}`;
    history.push({
      pathname: url,
      state: album,
    });
  };

  openAlbum = album => () => {
    const {
      history,
      location: { pathname },
      isMainPage,
    } = this.props;
    if (isMainPage) {
      history.push({
        pathname: `/profile/albums/${album.photoAlbumId}`,
        state: album,
      });
      return;
    }
    const url = `${pathname}/${album.photoAlbumId}`;
    history.push({
      pathname: url,
      state: album,
    });
  };

  render() {
    const { albums } = this.state;
    const { isMainPage } = this.props;
    return (
      <>
        {isMainPage ? (
          <Row type="flex" justify="center">
            <h2>Альбомы</h2>
          </Row>
        ) : null}
        {albums.length > 0 ? (
          <StyledAlbumWrapper>
            {albums.map(album => (
              <StyledAlbumCard onClick={this.openAlbum(album)} key={album.photoAlbumId}>
                <AlbomBackgroundImage
                  src={
                    album.thumbImageId
                      ? `http://localhost:8888/api/securedPhoto/photoFromAlbum/${album.thumbImageId}`
                      : `/defaultAlbumPicture.jpg`
                  }
                />
                <AlbomShadow>
                  <AlbumTitle>{album.title}</AlbumTitle>
                  <PhotoCounter>{album.photosCounter}</PhotoCounter>
                </AlbomShadow>

                <DeletePhotoButton
                  type="default"
                  title="Удалить альбом"
                  onClick={this.deleteAlbum(album)}
                >
                  <Icon type="delete" style={{ color: 'red' }} />
                </DeletePhotoButton>
                <EditPhotoButton
                  type="default"
                  title="Редактировать албом"
                  onClick={this.editPhotoAlbum(album)}
                >
                  <Icon type="edit" />
                </EditPhotoButton>
              </StyledAlbumCard>
            ))}
          </StyledAlbumWrapper>
        ) : (
          <Row type="flex" justify="center">
            <h4>Пока альбомов нет</h4>
          </Row>
        )}
        {isMainPage ? null : (
          <Row type="flex" justify="center">
            <Button type="primary" onClick={this.createNewAlbum}>
              Создать новый альбом
            </Button>
          </Row>
        )}
      </>
    );
  }
}

Albums.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  isMainPage: PropTypes.bool.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(Albums);
