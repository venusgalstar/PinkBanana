import React from "react";
import cn from "classnames";
import styles from "./FolowSteps.module.sass";
import LoaderCircle from "../../../components/LoaderCircle";
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';

const FolowSteps = ({ className, state, sale, navigate2Next, onClose}) => {

  console.log("[FolowSteps] state = ", state)

  switch(state)
  {
    default: 
      return(
        <div className={cn(className, styles.steps)}>
          <div className={cn("h4", styles.title)}>Follow steps</div>
          <div className={styles.list}>
            <h4>No content</h4>
          </div>
        </div>
      )
    case 1:
    case 2:
    case 4:
      return(
      <div className={cn(className, styles.steps)}>
        <div className={cn("h4", styles.title)}>Follow steps</div>
        <div className={styles.list}>
          <div className={styles.item}>
            <div className={styles.head}>
              <div className={styles.icon}>
                <LoaderCircle className={styles.loader} />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>Uploading items</div>
              </div>
            </div>            
            {
              sale >0 && 
              <div className={styles.head}>
                <div className={styles.icon}>
                  <LoaderCircle className={styles.loader} />
                </div>
                <div className={styles.details}>
                  <div className={styles.info}>Put on sale</div>
                  {/* <div className={styles.text}>
                    Create and sell your item
                  </div> */}
                </div>
              </div>
            }
            <button className={cn("button done", styles.button)}>
              Processing ...
            </button>
          </div>
        </div>
      </div>
      )
    case 3:
    case 6:
      return(
      <div className={cn(className, styles.error)}>
        <div className={cn("h4", styles.title)}>Follow steps</div>
        <div className={styles.list}>
          
        <div className={styles.item}>
            <div className={styles.head}>
              <div className={styles.icon}>
                <DangerousOutlinedIcon  className={styles.loader} style={{fontSize : "56px"}} />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>Uploading failed</div>
              </div>
            </div>
            {
              sale >0 && 
              <div className={styles.head}>
                <div className={styles.icon}>
                  <DangerousOutlinedIcon  className={styles.loader} style={{fontSize : "56px"}} />
                </div>
                <div className={styles.details}>
                  <div className={styles.info}>Putting on sale failed</div>
                </div>
              </div>
            }
            {
              <button className={cn("button done", styles.button)} onClick={onClose}>
                Failed
              </button>
            }
          </div>
        </div>
      </div>
      )
    case 5:
    case 7:
      return (
        <div className={cn(className, styles.steps)}>
          <div className={cn("h4", styles.title)}>Follow steps</div>
          <div className={styles.list}>
          <div className={styles.item}>
            <div className={styles.head}>
              <div className={styles.icon}>
                <DoneOutlinedIcon  className={styles.loader} style={{fontSize : "56px"}} />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>Uploading succeed</div>
              </div>
            </div>
            {
              sale >0 && 
              <div className={styles.head}>
                <div className={styles.icon}>
                  <LoaderCircle className={styles.loader} />
                </div>
                <div className={styles.details}>
                  <div className={styles.info}>Putting on sale</div>
                </div>
              </div>
            }
            {
              sale > 0?
              <button className={cn("button done", styles.button)} >
                Processing ...
              </button>
              :
              <button className={cn("button ", styles.button)} onClick={navigate2Next}>
                Done
              </button>
            }
          </div>
        </div>
        </div>
      )
    case 8:
      return(
      <div className={cn(className, styles.done)}>
        <div className={cn("h4", styles.title)}>Follow steps</div>
        <div className={styles.list}>
          <div className={styles.item}>
            <div className={styles.head}>
              <div className={styles.icon}>
                <DoneOutlinedIcon  className={styles.loader} style={{fontSize : "56px"}} />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>Uploading succeed</div>
              </div>
            </div>
            <div className={styles.head}>
              <div className={styles.icon}>
                <DoneOutlinedIcon  className={styles.loader} style={{fontSize : "56px"}} />
              </div>
              <div className={styles.details}>
                <div className={styles.info}>Putting on sale succeed</div>
              </div>
            </div> 
            <button className={cn("button ", styles.button)} onClick={navigate2Next}>
              Done
            </button>            
          </div>             
        </div>
      </div>
      )
      case 9:
        return(
        <div className={cn(className, styles.error)}>
          <div className={cn("h4", styles.title)}>Follow steps</div>
          <div className={styles.list}>
            
          <div className={styles.item}>
              <div className={styles.head}>
                <div className={styles.icon}>
                  <DoneOutlinedIcon  className={styles.loader} style={{fontSize : "56px"}} />
                </div>
                <div className={styles.details}>
                  <div className={styles.info}>Uploading succeed</div>
                </div>
              </div>
              <div className={styles.head}>
                <div className={styles.icon}>
                  <DangerousOutlinedIcon  className={styles.loader} style={{fontSize : "56px"}} />
                </div>
                <div className={styles.details}>
                  <div className={styles.info}>Putting on sale failed</div>
                </div>
              </div>
              <button className={cn("button done", styles.button)} onClick={navigate2Next}>
                Failed
              </button>
            </div>
          </div>
        </div>
        )
  }
};

export default FolowSteps;
