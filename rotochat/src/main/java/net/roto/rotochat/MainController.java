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
 * Handles requests for the application home page.
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
	
	@RequestMapping(value = "/{chatRoomName}", method = RequestMethod.GET)
	public String chatRooms(@PathVariable String chatRoomName, Model model){
		logger.info("chatRoomName : " + chatRoomName);
		model.addAttribute("chatRoomName", chatRoomName);
		return "chat";
	}
	
}
