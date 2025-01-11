import  { useState, useEffect } from "react";
import { Button, message, Spin, Row, Col } from "antd";
import {
  GetCodes,
  UpdateCodeAfterCollect,
  AddCodeToCollect,
  GetCollectedCodes,
} from "../../../../services/https";
import { CodeInterface } from "../../../../interfaces/Code";
import dayjs from "dayjs";
import Ticket from "../../../../components/ticket";
import './index.css'

function UserCodes() {
  const [codes, setCodes] = useState<CodeInterface[]>([]);
  const [savedCodes, setSavedCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getCodes = async () => {
    setLoading(true);
    try {
      const res = await GetCodes();
      if (res) setCodes(res.data);
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการโหลดโค้ด");
    } finally {
      setLoading(false);
    }
  };

  const getCollectedCodes = async () => {
    const userId = localStorage.getItem("id") || "1";
    try {
      const res = await GetCollectedCodes(userId);
      if (res && res.data) {
        const collectedCodeIds = res.data.map((collect: { code_id: number }) =>
          String(collect.code_id)
        );
        setSavedCodes(collectedCodeIds);
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการโหลดโค้ดที่เก็บแล้ว");
    }
  };

  const handleSaveTicket = async (codeId: string) => {
    if (savedCodes.includes(codeId)) {
      message.warning("คุณได้เก็บโค้ดนี้ไปแล้ว");
      return;
    }

    try {
      await UpdateCodeAfterCollect(codeId);
      const userId = localStorage.getItem("id") || "1";
      const res = await AddCodeToCollect(userId, codeId);

      if (res.status === 200) {
        setSavedCodes([...savedCodes, codeId]);
        message.success("เก็บโค้ดสำเร็จ!");
      } else {
        message.warning("โค้ดนี้ถูกเก็บไปแล้ว");
      }
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเก็บโค้ด");
    }
  };

  const handleSaveAllTickets = async () => {
    const unsavedTickets = codes.filter(
      (code) => !savedCodes.includes(String(code.ID))
    );

    if (unsavedTickets.length === 0) {
      message.info("คุณได้เก็บโค้ดทั้งหมดแล้ว");
      return;
    }

    try {
      const userId = localStorage.getItem("id") || "1";

      for (const code of unsavedTickets) {
        await UpdateCodeAfterCollect(String(code.ID));
        await AddCodeToCollect(userId, String(code.ID));
      }

      const newSavedCodes = unsavedTickets.map((code) => String(code.ID));
      setSavedCodes([...savedCodes, ...newSavedCodes]);

      message.success("เก็บโค้ดทั้งหมดสำเร็จ!");
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการเก็บโค้ดทั้งหมด");
    }
  };

  useEffect(() => {
    getCodes();
    getCollectedCodes();
  }, []);

  return (
    <div>
      {loading ? (
        <div>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {codes.map((code) => (
            <Col xs={24} sm={12} md={8} key={code.ID}>
              <Ticket
                title={code.code_topic || "ไม่มีชื่อโค้ด"}
                description={code.code_description || "ไม่มีคำอธิบาย"}
                imageUrl={code.code_picture || "no pic"}
                isCollected={savedCodes.includes(String(code.ID))}
                onCollect={() => handleSaveTicket(String(code.ID))}
              >
                <p className="text-500">
                  หมดอายุ: {dayjs(code.date_end).format("DD/MM/YYYY")}
                </p>
              </Ticket>
            </Col>
          ))}
        </Row>
       
      )}

      <div className="button-container">
        <Button
          type="primary"
          onClick={handleSaveAllTickets}
          className="save-all-button"
        >
          เก็บทั้งหมด
        </Button>
      </div>

    </div>
  );
}

export default UserCodes;