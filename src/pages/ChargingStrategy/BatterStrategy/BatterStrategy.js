import React, { memo } from 'react';
import { Button, Slider, Tooltip } from 'antd';
import { InfoCircleOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import Battery from '@/components/Battery';
import styles from './batteryStrategy.module.less';

const ButtonGroup = Button.Group;

const BatteryStrategy = (props) => {
  const { electricity, voltage } = props;

  return (
    <div className={styles.batteryStrategy}>
      <div className={styles.electricity}>
        <div className={styles.electricityBattery}>
          <Tooltip placement="top" title={electricity.tip}>
            <span style={{whiteSpace:'nowrap',wordBreak:'break-all'}}> {electricity.title} </span>
            <InfoCircleOutlined />
          </Tooltip>
          <Battery value={electricity.value || 0} onChange={electricity.onChange} />
        </div>
        <div className={styles.electricityButton}>
          <Slider
            style={{ height: '80%' }}
            vertical
            min={0}
            max={100}
            value={electricity.value || 0}
            onChange={electricity.onChange}
            tooltipVisible={false}
          />
          <ButtonGroup>
            <Button
              size="small"
              icon={
                <MinusOutlined
                  onClick={() => {
                    if (electricity.value - 1 >= 0) {
                      electricity.onChange(electricity.value - 1);
                    }
                  }}
                />
              }
            />
            <Button
              size="small"
              icon={
                <PlusOutlined
                  onClick={() => {
                    if (electricity.value + 1 <= 100) {
                      electricity.onChange(electricity.value + 1);
                    }
                  }}
                />
              }
            />
          </ButtonGroup>
        </div>
      </div>
      <div className={styles.voltage}>
        {voltage && (
          <>
            <Tooltip placement="top" title={voltage.tip}>
              {voltage.title} <InfoCircleOutlined />
            </Tooltip>
            <div className={styles.voltageInfo}>{`${voltage?.value || 0} V`}</div>
            <Slider
              min={35}
              max={65}
              step={0.1}
              value={voltage?.value || 0}
              onChange={voltage.onChange}
              tooltipVisible={false}
            />
          </>
        )}
      </div>
    </div>
  );
};
export default memo(BatteryStrategy);
