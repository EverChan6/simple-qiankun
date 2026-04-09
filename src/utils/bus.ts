import mitt from 'mitt';

type BusEvents = {
  sendMsg: string;
  sendNum: number;
};

const bus = mitt<BusEvents>();
export default bus;