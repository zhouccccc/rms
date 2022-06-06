import React, { memo } from 'react';
import { CloseOutlined, HolderOutlined } from '@ant-design/icons';
import { Draggable } from 'react-smooth-dnd';
import { Colors } from '@/config/consts';
import styles from './programing.module.less';
import { Row } from 'antd';

const ProgramingDndCard = (props) => {
  const { index, title, subTitle, onDelete } = props;

  return (
    <Draggable className={styles.dndCard}>
      <Row align={'middle'} style={{ marginRight: 8 }}>
        <HolderOutlined style={{ color: Colors.blue }} />
      </Row>
      <div style={{ flex: 1 }}>
        <h4 className={styles.dndTitle}>{title}</h4>
        <div className={styles.dndSubTitle}>{subTitle}</div>
      </div>
      <Row align={'middle'} style={{ marginLeft: 8, cursor: 'pointer' }}>
        <CloseOutlined
          onClick={() => {
            onDelete(index);
          }}
        />
      </Row>
    </Draggable>
  );
};
export default memo(ProgramingDndCard);
