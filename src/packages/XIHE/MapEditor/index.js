import React, { memo, useEffect } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { connect } from '@/utils/dva';
import { HeaderHeight } from './enums';
import MapEditorHeader from './components/EditorHeader';
import EditorBodyLeft from './components/EditorBodyLeft';
import EditorBodyRight from './components/EditorBodyRight';
import EditorMapContainer from './components/EditorMapContainer';
import EditorFooter from './components/EditorFooter';
import commonStyles from '@/common.module.less';
import styles from './editorLayout.module.less';

const MapEditor = (props) => {
  const { dispatch, mapList } = props;

  useEffect(() => {
    document.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
    });
    dispatch({ type: 'editor/editorInitial' });
  }, []);

  return (
    <div id={'mapEditorPage'} className={commonStyles.commonPageStyleNoPadding}>
      <div className={commonStyles.mapLayoutHeader} style={{ flex: `0 0 ${HeaderHeight}px` }}>
        {Array.isArray(mapList) ? (
          <MapEditorHeader />
        ) : (
          <LoadingOutlined style={{ fontSize: 20 }} spin />
        )}
      </div>
      <div className={commonStyles.mapLayoutBody}>
        <EditorBodyLeft />
        <div className={styles.editorBodyMiddle}>
          <div style={{ display: 'flex', flex: 1 }}>
            <EditorMapContainer />
            <EditorBodyRight />
          </div>
          <EditorFooter />
        </div>
      </div>
    </div>
  );
};
export default connect(({ editor }) => ({
  mapList: editor.mapList,
}))(memo(MapEditor));
