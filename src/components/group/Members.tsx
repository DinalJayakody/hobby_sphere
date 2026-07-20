import React from "react";
import ComingSoon from "./ComingSoon";

const Members: React.FC<{ groupId: string; isAdmin?: boolean }> = () => <ComingSoon label="Member management" />;

export default Members;
