package net.roto.rotochat;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * 메인 컨트롤러.
 * 대부분의 요청 처리는 이곳에서 함.
 * @author rotoshine
 *
 */
@Controller
public class MainController {
	private static final Logger logger = LoggerFactory.getLogger(MainController.class);
	
	/**
	 * Simply selects the home view to render by returning its name.
	 */
	@RequestMapping(value = {"", "/"} , method = RequestMethod.GET)
	public String home(HttpServletRequest request, Model model) {
		logger.info("request ip : " + request.getRemoteAddr() );
		return "home";
	}
	
	/**
	 * 채널에 입장한다.
	 * @param chatRoomName	입장 채널명
	 * @param model
	 * @return
	 */
	@RequestMapping(value = "/{chatRoomName}", method = RequestMethod.GET)
	public String joinChatRoom(@PathVariable String chatRoomName, Model model){
		// TODO 접속 내역 기록하는 로직을 여기에 추가하던지 server 스크립트에 추가할 것.
		logger.info("chatRoomName : " + chatRoomName);
		model.addAttribute("chatRoomName", chatRoomName);
		return "chat";
	}
	
}
